-- Script pour ajouter la colonne plan_type à la table profiles
-- Exécutez ce script si vous avez déjà créé la table profiles

-- Ajouter la colonne plan_type si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'plan_type'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN plan_type TEXT DEFAULT 'free' 
    CHECK (plan_type IN ('free', 'pro', 'enterprise'));
  END IF;
END $$;

-- Mettre à jour les utilisateurs existants avec 'active' vers 'pro' par défaut
UPDATE profiles
SET plan_type = 'pro'
WHERE subscription_status = 'active' AND (plan_type IS NULL OR plan_type = 'free');

