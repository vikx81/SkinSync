-- SkinSync Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE product_status AS ENUM ('active', 'retired');
CREATE TYPE product_category AS ENUM (
  'cleanser',
  'toner',
  'serum',
  'moisturizer',
  'sunscreen',
  'treatment',
  'eye-cream',
  'mask',
  'exfoliant',
  'retinol',
  'other'
);
CREATE TYPE time_of_day AS ENUM ('AM', 'PM');
CREATE TYPE treatment_type AS ENUM (
  'EXION',
  'IPL',
  'Microneedling',
  'Chemical Peel',
  'Laser',
  'Botox',
  'Filler',
  'HydraFacial',
  'LED Therapy',
  'Other'
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  category product_category NOT NULL,
  status product_status NOT NULL DEFAULT 'active',
  is_retinol BOOLEAN NOT NULL DEFAULT false,
  date_started DATE NOT NULL DEFAULT CURRENT_DATE,
  date_stopped DATE,
  reason_stopped TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Routines table
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_of_day time_of_day NOT NULL,
  product_ids UUID[] NOT NULL DEFAULT '{}',
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treatments table
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  treatment_type treatment_type NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  photo_url TEXT,
  buffer_days INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table (for progress tracking)
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category VARCHAR(50), -- 'routine', 'treatment', 'progress'
  routine_id UUID REFERENCES routines(id) ON DELETE SET NULL,
  treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  dark_mode BOOLEAN NOT NULL DEFAULT false,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_time TIME DEFAULT '20:00:00',
  retinol_reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  product_evaluation_days INTEGER NOT NULL DEFAULT 90,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_routines_user_id ON routines(user_id);
CREATE INDEX idx_routines_date ON routines(date);
CREATE INDEX idx_treatments_user_id ON treatments(user_id);
CREATE INDEX idx_treatments_date ON treatments(date);
CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_date ON photos(date);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Products policies
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- Routines policies
CREATE POLICY "Users can view own routines" ON routines
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines" ON routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines" ON routines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines" ON routines
  FOR DELETE USING (auth.uid() = user_id);

-- Treatments policies
CREATE POLICY "Users can view own treatments" ON treatments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own treatments" ON treatments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own treatments" ON treatments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own treatments" ON treatments
  FOR DELETE USING (auth.uid() = user_id);

-- Photos policies
CREATE POLICY "Users can view own photos" ON photos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos" ON photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos" ON photos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos" ON photos
  FOR DELETE USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically create user settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user settings on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routines_updated_at
  BEFORE UPDATE ON routines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatments_updated_at
  BEFORE UPDATE ON treatments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for photos (run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- Storage policies (run in Supabase dashboard)
-- CREATE POLICY "Users can upload own photos" ON storage.objects
--   FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view own photos" ON storage.objects
--   FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own photos" ON storage.objects
--   FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
