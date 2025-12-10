# Guide d'Installation du Feature Gating

## Étape 1 : Exécuter la Migration SQL

1. **Ouvrez votre projet Supabase** dans le dashboard
2. Allez dans **SQL Editor** (menu de gauche)
3. Cliquez sur **New Query**
4. Copiez-collez le contenu du fichier `supabase-feature-gating-migration.sql`
5. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter`)

### Vérification

Après l'exécution, vérifiez que :
- La colonne `plan` existe dans la table `profiles`
- La colonne `scans_this_month` existe dans la table `restaurants`
- La table `staff_members` existe

Vous pouvez exécuter ces requêtes pour vérifier :

```sql
-- Vérifier la colonne plan
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'plan';

-- Vérifier la colonne scans_this_month
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'restaurants' AND column_name = 'scans_this_month';

-- Vérifier la table staff_members
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'staff_members';
```

## Étape 2 : Créer la Fonction de Réinitialisation Mensuelle

Exécutez le script SQL suivant pour créer une fonction qui réinitialise automatiquement les scans chaque mois :

```sql
-- Fonction pour réinitialiser les scans mensuellement
CREATE OR REPLACE FUNCTION reset_monthly_scans()
RETURNS void AS $$
BEGIN
  UPDATE restaurants
  SET scans_this_month = 0
  WHERE scans_this_month > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer un job pg_cron pour exécuter la fonction le 1er de chaque mois à minuit
-- Note: pg_cron doit être activé dans votre projet Supabase
SELECT cron.schedule(
  'reset-monthly-scans',
  '0 0 1 * *', -- Le 1er de chaque mois à minuit (format: minute hour day month day-of-week)
  $$SELECT reset_monthly_scans()$$
);
```

### Alternative : Utiliser Supabase Edge Functions (Recommandé)

Si pg_cron n'est pas disponible, vous pouvez créer une Edge Function qui sera appelée par un service externe (cron job) :

1. Créez un fichier `supabase/functions/reset-scans/index.ts` (voir le fichier fourni)
2. Déployez-la avec : `supabase functions deploy reset-scans`
3. Configurez un cron job externe (ex: GitHub Actions, Vercel Cron, etc.) pour appeler cette fonction

## Étape 3 : Tester le Feature Gating

### Test 1 : Plan Gratuit - Limite de Scans

1. Créez un compte de test ou utilisez un compte existant
2. Assurez-vous que le plan est 'free' :
   ```sql
   UPDATE profiles SET plan = 'free' WHERE email = 'votre-email@test.com';
   ```
3. Mettez `scans_this_month` à 30 :
   ```sql
   UPDATE restaurants 
   SET scans_this_month = 30 
   WHERE user_id = (SELECT id FROM profiles WHERE email = 'votre-email@test.com');
   ```
4. Scannez le QR code → Devrait rediriger directement vers Google Maps (bypass du SaaS)

### Test 2 : Plan Gratuit - Branding

1. Avec un compte free, visitez `/review/[slug]`
2. Vérifiez que le footer "Propulsé par RestoBoost" est visible

### Test 3 : Plan Pro - Pas de Branding

1. Mettez un compte en plan 'pro' :
   ```sql
   UPDATE profiles SET plan = 'pro', subscription_status = 'active' WHERE email = 'votre-email@test.com';
   ```
2. Visitez `/review/[slug]`
3. Vérifiez que le footer n'est PAS visible

### Test 4 : Plan Pro - Alertes Email

1. Avec un compte pro, soumettez un feedback négatif (1-3 étoiles)
2. Vérifiez que vous recevez un email via Resend

### Test 5 : Plan Gratuit - Pas d'Email

1. Avec un compte free, soumettez un feedback négatif
2. Vérifiez dans la base de données que le feedback est sauvegardé :
   ```sql
   SELECT * FROM feedback ORDER BY created_at DESC LIMIT 1;
   ```
3. Vérifiez que vous N'avez PAS reçu d'email

### Test 6 : Staff Tracking (Pro/Enterprise uniquement)

1. Avec un compte pro, allez dans Dashboard > Personnel
2. Créez un membre du personnel
3. Copiez l'URL avec `staff_id`
4. Scannez le QR code avec cette URL
5. Vérifiez que `total_scans` du staff membre s'incrémente :
   ```sql
   SELECT name, total_scans FROM staff_members WHERE restaurant_id = 'votre-restaurant-id';
   ```

### Test 7 : Dashboard - Bannière Free Plan

1. Avec un compte free, allez dans Dashboard
2. Vérifiez que la bannière "Upgrade to Pro" est visible

### Test 8 : Dashboard - Onglet Personnel

1. Avec un compte free, vérifiez que l'onglet "Personnel" n'est PAS visible
2. Avec un compte pro, vérifiez que l'onglet "Personnel" est visible

## Étape 4 : Mettre à jour les Plans Existants

Si vous avez des utilisateurs existants, mettez à jour leur plan :

```sql
-- Mettre tous les utilisateurs existants en 'free' si plan est NULL
UPDATE profiles 
SET plan = 'free' 
WHERE plan IS NULL;

-- Synchroniser plan avec plan_type si nécessaire
UPDATE profiles 
SET plan = plan_type 
WHERE plan IS NULL AND plan_type IS NOT NULL;
```

## Étape 5 : Vérifier le Webhook Stripe

Assurez-vous que le webhook Stripe met à jour le champ `plan` :

1. Testez un checkout Stripe
2. Vérifiez que le plan est mis à jour :
   ```sql
   SELECT email, plan, plan_type, subscription_status 
   FROM profiles 
   WHERE email = 'votre-email@test.com';
   ```

## Dépannage

### Erreur : "column does not exist"
- Vérifiez que vous avez bien exécuté la migration SQL
- Vérifiez que vous êtes dans le bon projet Supabase

### Erreur : "permission denied"
- Vérifiez que les RLS policies sont correctement configurées
- Utilisez le client admin pour les opérations serveur

### Les scans ne se réinitialisent pas
- Vérifiez que pg_cron est activé dans Supabase
- Vérifiez les logs de la fonction cron
- Utilisez l'alternative Edge Function si nécessaire

