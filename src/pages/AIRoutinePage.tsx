import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Sparkles, Sun, Moon, Edit3, Check, X, AlertCircle, Lightbulb, Camera } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useRoutines } from '../hooks/useRoutines';
import { useTreatments } from '../hooks/useTreatments';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { generateAIRecommendation, type RecommendedRoutine } from '../lib/aiRecommendations';
import { SkinGoalsQuiz } from '../components/SkinGoalsQuiz';
import type { SkinProfile } from '../types/skinGoals';
import { uploadPhoto } from '../lib/supabase';
import toast from 'react-hot-toast';

export function AIRoutinePage() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [editingAM, setEditingAM] = useState(false);
  const [editingPM, setEditingPM] = useState(false);
  const [customAM, setCustomAM] = useState<string[]>([]);
  const [customPM, setCustomPM] = useState<string[]>([]);
  const [notesAM, setNotesAM] = useState('');
  const [notesPM, setNotesPM] = useState('');
  const [photoFileAM, setPhotoFileAM] = useState<File | null>(null);
  const [photoFilePM, setPhotoFilePM] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const { activeProducts } = useProducts();
  const { addRoutine, getTodayRoutines } = useRoutines();
  const { treatments } = useTreatments();
  const user = useAuthStore((state) => state.user);
  const { settings, updateSettings } = useSettingsStore();

  const skinProfile: SkinProfile | null = useMemo(() => {
    if (!settings?.skin_profile) return null;
    try {
      return JSON.parse(settings.skin_profile);
    } catch {
      return null;
    }
  }, [settings?.skin_profile]);

  const todayRoutines = getTodayRoutines();
  const hasAMRoutine = todayRoutines.some((r) => r.time_of_day === 'AM');
  const hasPMRoutine = todayRoutines.some((r) => r.time_of_day === 'PM');

  // Generate AI recommendations
  const recommendation = useMemo(() => {
    return generateAIRecommendation(activeProducts, skinProfile, treatments);
  }, [activeProducts, skinProfile, treatments]);

  useEffect(() => {
    // Check if user needs to take quiz
    if (!skinProfile && !showQuiz && settings) {
      setShowQuiz(true);
    }
  }, [skinProfile, settings, showQuiz]);

  useEffect(() => {
    setCustomAM(recommendation.am.products.map((p) => p.id));
    setCustomPM(recommendation.pm.products.map((p) => p.id));
  }, [recommendation]);

  const handleQuizComplete = async (profile: SkinProfile) => {
    if (!settings) return;
    await updateSettings({ skin_profile: JSON.stringify(profile) });
    setShowQuiz(false);
  };

  const handleQuizSkip = () => {
    setShowQuiz(false);
  };

  const handleRetakeQuiz = () => {
    setShowQuiz(true);
  };

  const toggleProductAM = (productId: string) => {
    setCustomAM((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleProductPM = (productId: string) => {
    setCustomPM((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSaveRoutine = async (timeOfDay: 'AM' | 'PM') => {
    const productIds = timeOfDay === 'AM' ? customAM : customPM;
    const notes = timeOfDay === 'AM' ? notesAM : notesPM;
    const photoFile = timeOfDay === 'AM' ? photoFileAM : photoFilePM;

    if (productIds.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    setSaving(true);

    let photoUrl: string | undefined;
    if (photoFile && user) {
      photoUrl = (await uploadPhoto(photoFile, user.id, 'routine')) || undefined;
    }

    const { error } = await addRoutine({
      time_of_day: timeOfDay,
      product_ids: productIds,
      notes: notes || undefined,
      photo_url: photoUrl,
    });

    if (error) {
      toast.error('Failed to save routine');
    } else {
      toast.success(`${timeOfDay} routine logged!`);
      if (timeOfDay === 'AM') {
        setEditingAM(false);
        setPhotoFileAM(null);
      } else {
        setEditingPM(false);
        setPhotoFilePM(null);
      }
    }

    setSaving(false);
  };

  if (showQuiz) {
    return <SkinGoalsQuiz onComplete={handleQuizComplete} onSkip={handleQuizSkip} />;
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="glass rounded-3xl p-6 shadow-soft-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="section-header">AI Routine</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
        </div>

        {skinProfile ? (
          <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-primary-900 dark:text-primary-100">
                  Personalized for {skinProfile.skinType} skin
                </p>
                <p className="text-xs text-primary-700 dark:text-primary-300 mt-1">
                  Goals: {skinProfile.goals.slice(0, 2).map((g) => g.replace(/-/g, ' ')).join(', ')}
                </p>
              </div>
              <button
                onClick={handleRetakeQuiz}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowQuiz(true)}
            className="mt-4 w-full p-4 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-xl font-semibold hover:shadow-soft-lg transition-all"
          >
            Take Skin Quiz for Personalized Recommendations
          </button>
        )}
      </div>

      {/* AM Routine */}
      <RoutineCard
        recommendation={recommendation.am}
        editing={editingAM}
        completed={hasAMRoutine}
        customProducts={customAM}
        allProducts={activeProducts}
        onToggleEdit={() => setEditingAM(!editingAM)}
        onToggleProduct={toggleProductAM}
        onSave={() => handleSaveRoutine('AM')}
        onCancel={() => {
          setEditingAM(false);
          setCustomAM(recommendation.am.products.map((p) => p.id));
        }}
        notes={notesAM}
        onNotesChange={setNotesAM}
        saving={saving}
      />

      {/* PM Routine */}
      <RoutineCard
        recommendation={recommendation.pm}
        editing={editingPM}
        completed={hasPMRoutine}
        customProducts={customPM}
        allProducts={activeProducts}
        onToggleEdit={() => setEditingPM(!editingPM)}
        onToggleProduct={toggleProductPM}
        onSave={() => handleSaveRoutine('PM')}
        onCancel={() => {
          setEditingPM(false);
          setCustomPM(recommendation.pm.products.map((p) => p.id));
        }}
        notes={notesPM}
        onNotesChange={setNotesPM}
        saving={saving}
      />
    </div>
  );
}

interface RoutineCardProps {
  recommendation: RecommendedRoutine;
  editing: boolean;
  completed: boolean;
  customProducts: string[];
  allProducts: any[];
  onToggleEdit: () => void;
  onToggleProduct: (id: string) => void;
  onSave: () => void;
  onCancel: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  saving: boolean;
}

function RoutineCard({
  recommendation,
  editing,
  completed,
  customProducts,
  allProducts,
  onToggleEdit,
  onToggleProduct,
  onSave,
  onCancel,
  notes,
  onNotesChange,
  saving,
}: RoutineCardProps) {
  const Icon = recommendation.timeOfDay === 'AM' ? Sun : Moon;
  const color = recommendation.timeOfDay === 'AM' ? 'yellow' : 'blue';

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center`}>
            <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">
              {recommendation.timeOfDay} Routine
            </h2>
            {completed && (
              <span className="badge-success text-xs">✓ Completed today</span>
            )}
          </div>
        </div>
        {!editing && !completed && (
          <button onClick={onToggleEdit} className="btn-secondary text-sm py-2 px-4">
            <Edit3 className="w-4 h-4 inline mr-2" />
            Modify
          </button>
        )}
      </div>

      {/* Reasoning */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <Lightbulb className="w-4 h-4 inline mr-2" />
          {recommendation.reasoning}
        </p>
      </div>

      {/* Warnings */}
      {recommendation.warnings.length > 0 && (
        <div className="mb-4 space-y-2">
          {recommendation.warnings.map((warning, i) => (
            <div key={i} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                {warning}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Products */}
      <div className="space-y-2 mb-4">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
          Products ({editing ? customProducts.length : recommendation.products.length})
        </h3>

        {editing ? (
          <div className="space-y-2">
            {allProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => onToggleProduct(product.id)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                  customProducts.includes(product.id)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product.product_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.brand} • {product.category}
                    </p>
                  </div>
                  {customProducts.includes(product.id) && (
                    <Check className="w-5 h-5 text-primary-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          recommendation.products.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
            >
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-semibold text-primary-700 dark:text-primary-300">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {product.product_name}
                </p>
                <p className="text-xs text-gray-500">
                  {product.brand && `${product.brand} • `}
                  {product.category}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tips */}
      {recommendation.tips.length > 0 && !editing && (
        <div className="space-y-2 mb-4">
          {recommendation.tips.map((tip, i) => (
            <div key={i} className="p-3 bg-accent-50 dark:bg-accent-900/20 rounded-xl">
              <p className="text-sm text-accent-900 dark:text-accent-100">💡 {tip}</p>
            </div>
          ))}
        </div>
      )}

      {/* Notes (when editing) */}
      {editing && (
        <div className="mb-4">
          <label className="label">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="input min-h-[60px]"
            placeholder="How does your skin feel?"
          />
        </div>
      )}

      {/* Actions */}
      {editing && (
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-secondary flex-1">
            <X className="w-4 h-4 inline mr-2" />
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || customProducts.length === 0}
            className="btn-primary flex-1"
          >
            <Check className="w-4 h-4 inline mr-2" />
            {saving ? 'Saving...' : 'Save Routine'}
          </button>
        </div>
      )}

      {!editing && !completed && (
        <button
          onClick={onSave}
          disabled={saving}
          className="btn-primary w-full"
        >
          {saving ? 'Saving...' : `Use This ${recommendation.timeOfDay} Routine`}
        </button>
      )}
    </div>
  );
}
