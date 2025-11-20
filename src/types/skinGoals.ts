export type SkinType = 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive';

export type SkinConcern =
  | 'acne'
  | 'aging'
  | 'dark-spots'
  | 'redness'
  | 'large-pores'
  | 'fine-lines'
  | 'dullness'
  | 'uneven-texture'
  | 'dehydration';

export type SkinGoal =
  | 'clear-skin'
  | 'anti-aging'
  | 'brightening'
  | 'hydration'
  | 'smoothing'
  | 'calming'
  | 'pore-minimizing';

export interface SkinProfile {
  skinType: SkinType;
  concerns: SkinConcern[];
  goals: SkinGoal[];
  sensitivityLevel: 'low' | 'medium' | 'high';
  preferredTexture: 'lightweight' | 'medium' | 'rich';
  completed: boolean;
  completedAt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple';
  options: QuizOption[];
}

export interface QuizOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'skinType',
    question: 'What is your skin type?',
    type: 'single',
    options: [
      {
        value: 'oily',
        label: 'Oily',
        description: 'Shiny, greasy, prone to breakouts',
        icon: '💧',
      },
      {
        value: 'dry',
        label: 'Dry',
        description: 'Tight, flaky, rough texture',
        icon: '🏜️',
      },
      {
        value: 'combination',
        label: 'Combination',
        description: 'Oily T-zone, dry cheeks',
        icon: '🔀',
      },
      {
        value: 'normal',
        label: 'Normal',
        description: 'Balanced, not too oily or dry',
        icon: '✨',
      },
      {
        value: 'sensitive',
        label: 'Sensitive',
        description: 'Easily irritated, reactive',
        icon: '🌸',
      },
    ],
  },
  {
    id: 'concerns',
    question: 'What are your main skin concerns? (Select all that apply)',
    type: 'multiple',
    options: [
      { value: 'acne', label: 'Acne & Breakouts', icon: '🔴' },
      { value: 'aging', label: 'Signs of Aging', icon: '⏰' },
      { value: 'dark-spots', label: 'Dark Spots & Hyperpigmentation', icon: '☀️' },
      { value: 'redness', label: 'Redness & Irritation', icon: '🔥' },
      { value: 'large-pores', label: 'Large Pores', icon: '🕳️' },
      { value: 'fine-lines', label: 'Fine Lines & Wrinkles', icon: '📏' },
      { value: 'dullness', label: 'Dullness & Uneven Tone', icon: '🌫️' },
      { value: 'uneven-texture', label: 'Uneven Texture', icon: '🏔️' },
      { value: 'dehydration', label: 'Dehydration', icon: '💦' },
    ],
  },
  {
    id: 'goals',
    question: 'What are your skincare goals? (Select up to 3)',
    type: 'multiple',
    options: [
      { value: 'clear-skin', label: 'Clear, Blemish-Free Skin', icon: '✨' },
      { value: 'anti-aging', label: 'Prevent & Reduce Aging Signs', icon: '🕰️' },
      { value: 'brightening', label: 'Brighter, More Even Tone', icon: '🌟' },
      { value: 'hydration', label: 'Deep Hydration & Plumpness', icon: '💧' },
      { value: 'smoothing', label: 'Smooth, Refined Texture', icon: '🎨' },
      { value: 'calming', label: 'Calm & Soothe Irritation', icon: '🌿' },
      { value: 'pore-minimizing', label: 'Minimize Pore Appearance', icon: '🔬' },
    ],
  },
  {
    id: 'sensitivity',
    question: 'How sensitive is your skin?',
    type: 'single',
    options: [
      {
        value: 'low',
        label: 'Not Sensitive',
        description: 'Can use most products without issues',
      },
      {
        value: 'medium',
        label: 'Somewhat Sensitive',
        description: 'Occasionally reacts to new products',
      },
      {
        value: 'high',
        label: 'Very Sensitive',
        description: 'Often reacts to products, needs gentle formulas',
      },
    ],
  },
  {
    id: 'texture',
    question: 'What product texture do you prefer?',
    type: 'single',
    options: [
      {
        value: 'lightweight',
        label: 'Lightweight',
        description: 'Gels, light lotions, quick-absorbing',
      },
      {
        value: 'medium',
        label: 'Medium',
        description: 'Lotions, creams, balanced feel',
      },
      {
        value: 'rich',
        label: 'Rich',
        description: 'Thick creams, balms, very moisturizing',
      },
    ],
  },
];
