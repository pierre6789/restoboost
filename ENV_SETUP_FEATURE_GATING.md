# Variables d'Environnement pour Feature Gating

Ajoutez ces variables à votre fichier `.env.local` :

```bash
# Secret pour sécuriser l'endpoint de réinitialisation des scans
# Génèrez une clé aléatoire (ex: openssl rand -hex 32)
RESET_SCANS_SECRET=your-secret-key-here
```

## Configuration selon votre méthode de cron

### Option 1: Vercel Cron
- Ajoutez `vercel-cron-config.json` à la racine de votre projet
- Configurez la variable `RESET_SCANS_SECRET` dans Vercel Dashboard > Settings > Environment Variables
- Vercel exécutera automatiquement `/api/cron/reset-scans` le 1er de chaque mois

### Option 2: GitHub Actions
- Ajoutez les secrets dans GitHub : Settings > Secrets and variables > Actions
  - `RESET_SCANS_SECRET`
  - `SUPABASE_URL`
- Le workflow `.github/workflows/reset-scans-monthly.yml` s'exécutera automatiquement

### Option 3: Supabase Edge Function
- Déployez la fonction : `supabase functions deploy reset-scans`
- Configurez les secrets dans Supabase Dashboard
- Utilisez un service externe (cron-job.org, etc.) pour appeler la fonction

### Option 4: pg_cron (dans Supabase)
- Exécutez `supabase-reset-scans-cron.sql` dans SQL Editor
- Aucune variable d'environnement supplémentaire nécessaire

