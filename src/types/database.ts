export type ProductStatus = 'active' | 'retired';

export type ProductCategory =
  | 'cleanser'
  | 'toner'
  | 'serum'
  | 'moisturizer'
  | 'sunscreen'
  | 'treatment'
  | 'eye-cream'
  | 'mask'
  | 'exfoliant'
  | 'retinol'
  | 'other';

export type TimeOfDay = 'AM' | 'PM';

export type TreatmentType =
  | 'EXION'
  | 'IPL'
  | 'Microneedling'
  | 'Chemical Peel'
  | 'Laser'
  | 'Botox'
  | 'Filler'
  | 'HydraFacial'
  | 'LED Therapy'
  | 'Other';

export interface Product {
  id: string;
  user_id: string;
  product_name: string;
  brand?: string;
  category: ProductCategory;
  status: ProductStatus;
  is_retinol: boolean;
  date_started: string;
  date_stopped?: string;
  reason_stopped?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Routine {
  id: string;
  user_id: string;
  date: string;
  time_of_day: TimeOfDay;
  product_ids: string[];
  notes?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Treatment {
  id: string;
  user_id: string;
  treatment_type: TreatmentType;
  date: string;
  notes?: string;
  photo_url?: string;
  buffer_days: number;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  user_id: string;
  url: string;
  date: string;
  category?: string;
  routine_id?: string;
  treatment_id?: string;
  notes?: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  dark_mode: boolean;
  notifications_enabled: boolean;
  reminder_time: string;
  retinol_reminder_enabled: boolean;
  product_evaluation_days: number;
  skin_profile?: string; // JSON string of SkinProfile
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
      };
      routines: {
        Row: Routine;
        Insert: Omit<Routine, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Routine, 'id' | 'created_at' | 'updated_at'>>;
      };
      treatments: {
        Row: Treatment;
        Insert: Omit<Treatment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Treatment, 'id' | 'created_at' | 'updated_at'>>;
      };
      photos: {
        Row: Photo;
        Insert: Omit<Photo, 'id' | 'created_at'>;
        Update: Partial<Omit<Photo, 'id' | 'created_at'>>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
