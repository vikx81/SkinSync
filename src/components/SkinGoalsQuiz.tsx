import { useState, useEffect } from 'react';
import { Check, ChevronRight, ChevronLeft, Sparkles, PartyPopper } from 'lucide-react';
import { QUIZ_QUESTIONS, type SkinProfile, type SkinConcern, type SkinGoal } from '../types/skinGoals';
import toast from 'react-hot-toast';

interface SkinGoalsQuizProps {
  onComplete: (profile: SkinProfile) => void;
  onSkip: () => void;
}

export function SkinGoalsQuiz({ onComplete, onSkip }: SkinGoalsQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentStep];
  const isLastStep = currentStep === QUIZ_QUESTIONS.length - 1;
  const progress = ((currentStep + 1) / QUIZ_QUESTIONS.length) * 100;

  const handleSelect = (value: string) => {
    if (currentQuestion.type === 'single') {
      setAnswers({ ...answers, [currentQuestion.id]: value });
    } else {
      const current = (answers[currentQuestion.id] as string[]) || [];
      const newSelection = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setAnswers({ ...answers, [currentQuestion.id]: newSelection });
    }
  };

  const isSelected = (value: string) => {
    const answer = answers[currentQuestion.id];
    if (Array.isArray(answer)) {
      return answer.includes(value);
    }
    return answer === value;
  };

  const canProceed = () => {
    const answer = answers[currentQuestion.id];
    if (!answer) return false;
    if (Array.isArray(answer)) return answer.length > 0;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast.error('Please select at least one option');
      return;
    }

    if (isLastStep) {
      // Complete quiz and show success screen
      const profile: SkinProfile = {
        skinType: answers.skinType as any,
        concerns: answers.concerns as SkinConcern[],
        goals: answers.goals as SkinGoal[],
        sensitivityLevel: answers.sensitivity as any,
        preferredTexture: answers.texture as any,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      setShowSuccess(true);
      // Call onComplete after showing success screen
      setTimeout(() => {
        onComplete(profile);
      }, 2000); // Redirect after 2 seconds
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Success screen
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center animate-in fade-in duration-500">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 mb-6 animate-bounce">
            <PartyPopper className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Skin Profile Created!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Generating your personalized AI routine...
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Skin Goals Quiz
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Help us understand your skin to create personalized routines
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Question {currentStep + 1} of {QUIZ_QUESTIONS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="card p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected(option.value)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-soft'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  {option.icon && (
                    <span className="text-2xl flex-shrink-0">{option.icon}</span>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {option.label}
                      </span>
                      {isSelected(option.value) && (
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    {option.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="btn-secondary flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isLastStep ? 'Complete' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Skip Link */}
        <div className="text-center mt-4">
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
