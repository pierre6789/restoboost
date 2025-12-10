-- Script SQL pour créer la fonction de réinitialisation mensuelle des scans
-- NOTE: pg_cron n'est pas disponible dans votre projet Supabase
-- Cette fonction sera appelée via une API Route (Vercel Cron) ou GitHub Actions

-- Créer la fonction de réinitialisation
CREATE OR REPLACE FUNCTION reset_monthly_scans()
RETURNS void AS $$
BEGIN
  UPDATE restaurants
  SET scans_this_month = 0
  WHERE scans_this_month > 0;
  
  -- Log pour le débogage
  RAISE NOTICE 'Scans réinitialisés le %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- IMPORTANT: pg_cron n'est pas disponible dans votre projet Supabase
-- Vous devez utiliser une des alternatives suivantes :
-- 
-- Option 1: API Route + Vercel Cron (RECOMMANDÉ si vous déployez sur Vercel)
--   - Le fichier src/app/api/cron/reset-scans/route.ts est déjà créé
--   - Ajoutez vercel-cron-config.json à la racine
--   - Configurez RESET_SCANS_SECRET dans Vercel
--
-- Option 2: GitHub Actions
--   - Le fichier .github/workflows/reset-scans-monthly.yml est déjà créé
--   - Configurez les secrets dans GitHub
--
-- Option 3: Supabase Edge Function
--   - Le fichier supabase/functions/reset-scans/index.ts est déjà créé
--   - Déployez avec: supabase functions deploy reset-scans

-- Pour tester manuellement la fonction (sans attendre le cron)
-- SELECT reset_monthly_scans();

-- Pour voir les jobs cron actifs
-- SELECT * FROM cron.job;

-- Pour supprimer le job cron
-- SELECT cron.unschedule('reset-monthly-scans');

