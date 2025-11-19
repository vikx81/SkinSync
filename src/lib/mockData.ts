import { Product, Routine, Treatment, Photo, UserSettings } from '../types/database';

// Demo user ID
export const DEMO_USER_ID = 'demo-user-123';

// Sample products
export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    user_id: DEMO_USER_ID,
    product_name: 'Gentle Foaming Cleanser',
    brand: 'CeraVe',
    category: 'cleanser',
    status: 'active',
    is_retinol: false,
    date_started: '2024-06-01',
    notes: 'Great for morning cleanse',
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'prod-2',
    user_id: DEMO_USER_ID,
    product_name: 'Vitamin C Serum',
    brand: 'SkinCeuticals',
    category: 'serum',
    status: 'active',
    is_retinol: false,
    date_started: '2024-07-15',
    notes: 'Use in AM only',
    created_at: '2024-07-15T00:00:00Z',
    updated_at: '2024-07-15T00:00:00Z',
  },
  {
    id: 'prod-3',
    user_id: DEMO_USER_ID,
    product_name: 'Retinol 0.5%',
    brand: 'The Ordinary',
    category: 'retinol',
    status: 'active',
    is_retinol: true,
    date_started: '2024-08-01',
    notes: 'Start with 2x per week',
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2024-08-01T00:00:00Z',
  },
  {
    id: 'prod-4',
    user_id: DEMO_USER_ID,
    product_name: 'Daily Moisturizer SPF 30',
    brand: 'La Roche-Posay',
    category: 'sunscreen',
    status: 'active',
    is_retinol: false,
    date_started: '2024-06-01',
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'prod-5',
    user_id: DEMO_USER_ID,
    product_name: 'Hyaluronic Acid Serum',
    brand: 'The Ordinary',
    category: 'serum',
    status: 'active',
    is_retinol: false,
    date_started: '2024-07-01',
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z',
  },
  {
    id: 'prod-6',
    user_id: DEMO_USER_ID,
    product_name: 'Night Cream',
    brand: 'Olay',
    category: 'moisturizer',
    status: 'active',
    is_retinol: false,
    date_started: '2024-06-15',
    created_at: '2024-06-15T00:00:00Z',
    updated_at: '2024-06-15T00:00:00Z',
  },
  {
    id: 'prod-7',
    user_id: DEMO_USER_ID,
    product_name: 'Old Toner',
    brand: 'Generic',
    category: 'toner',
    status: 'retired',
    is_retinol: false,
    date_started: '2024-01-01',
    date_stopped: '2024-05-01',
    reason_stopped: 'Switched to better product',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-05-01T00:00:00Z',
  },
];

// Get today and recent dates
const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

// Sample routines
export const mockRoutines: Routine[] = [
  {
    id: 'routine-1',
    user_id: DEMO_USER_ID,
    date: today,
    time_of_day: 'AM',
    product_ids: ['prod-1', 'prod-2', 'prod-4'],
    notes: 'Skin feeling good today!',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'routine-2',
    user_id: DEMO_USER_ID,
    date: yesterday,
    time_of_day: 'AM',
    product_ids: ['prod-1', 'prod-2', 'prod-5', 'prod-4'],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'routine-3',
    user_id: DEMO_USER_ID,
    date: yesterday,
    time_of_day: 'PM',
    product_ids: ['prod-1', 'prod-5', 'prod-3', 'prod-6'],
    notes: 'Used retinol tonight',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'routine-4',
    user_id: DEMO_USER_ID,
    date: twoDaysAgo,
    time_of_day: 'AM',
    product_ids: ['prod-1', 'prod-2', 'prod-4'],
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'routine-5',
    user_id: DEMO_USER_ID,
    date: twoDaysAgo,
    time_of_day: 'PM',
    product_ids: ['prod-1', 'prod-5', 'prod-6'],
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

// Sample treatments
export const mockTreatments: Treatment[] = [
  {
    id: 'treatment-1',
    user_id: DEMO_USER_ID,
    treatment_type: 'HydraFacial',
    date: new Date(Date.now() - 604800000).toISOString().split('T')[0], // 7 days ago
    notes: 'Monthly maintenance facial',
    buffer_days: 3,
    created_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 'treatment-2',
    user_id: DEMO_USER_ID,
    treatment_type: 'IPL',
    date: new Date(Date.now() - 2592000000).toISOString().split('T')[0], // 30 days ago
    notes: 'First IPL session for sun damage',
    buffer_days: 7,
    created_at: new Date(Date.now() - 2592000000).toISOString(),
    updated_at: new Date(Date.now() - 2592000000).toISOString(),
  },
];

// Sample photos
export const mockPhotos: Photo[] = [];

// User settings
export const mockUserSettings: UserSettings = {
  id: 'settings-1',
  user_id: DEMO_USER_ID,
  dark_mode: false,
  notifications_enabled: true,
  reminder_time: '20:00:00',
  retinol_reminder_enabled: true,
  product_evaluation_days: 90,
  created_at: '2024-06-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
};

// Helper to generate UUIDs for new items
export function generateId(): string {
  return 'id-' + Math.random().toString(36).substr(2, 9);
}
