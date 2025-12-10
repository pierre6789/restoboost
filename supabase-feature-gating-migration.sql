-- RestoBoost Feature Gating Migration
-- Execute this in the Supabase SQL Editor
-- This migration adds plan field, scans_this_month, and staff_members table

-- 1. Add 'plan' column to profiles table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'plan'
  ) THEN
    ALTER TABLE profiles ADD COLUMN plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise'));
  END IF;
END $$;

-- Update existing plan_type to plan (migrate data)
UPDATE profiles SET plan = plan_type WHERE plan IS NULL OR plan = 'free';

-- 2. Add scans_this_month to restaurants table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurants' AND column_name = 'scans_this_month'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN scans_this_month INTEGER DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- 3. Create staff_members table
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_scans INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create index for staff_members
CREATE INDEX IF NOT EXISTS idx_staff_members_restaurant_id ON staff_members(restaurant_id);

-- Enable RLS for staff_members
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff_members
DROP POLICY IF EXISTS "Users can view staff for their restaurants" ON staff_members;
CREATE POLICY "Users can view staff for their restaurants"
  ON staff_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = staff_members.restaurant_id
      AND restaurants.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert staff for their restaurants" ON staff_members;
CREATE POLICY "Users can insert staff for their restaurants"
  ON staff_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = staff_members.restaurant_id
      AND restaurants.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update staff for their restaurants" ON staff_members;
CREATE POLICY "Users can update staff for their restaurants"
  ON staff_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = staff_members.restaurant_id
      AND restaurants.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete staff for their restaurants" ON staff_members;
CREATE POLICY "Users can delete staff for their restaurants"
  ON staff_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = staff_members.restaurant_id
      AND restaurants.user_id = auth.uid()
    )
  );

-- Trigger for updated_at on staff_members
CREATE TRIGGER update_staff_members_updated_at
  BEFORE UPDATE ON staff_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

