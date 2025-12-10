# Instructions pour la Réinitialisation Mensuelle des Scans

## ⚠️ pg_cron n'est pas disponible

Votre projet Supabase n'a pas pg_cron activé. Vous devez utiliser une alternative.

## ✅ Option Recommandée : API Route + Vercel Cron

Si vous déployez sur **Vercel**, c'est la solution la plus simple :

### Étape 1 : Créer la fonction SQL
Exécutez le fichier `supabase-reset-scans-cron.sql` dans Supabase SQL Editor (il crée seulement la fonction, pas le cron).

### Étape 2 : Configurer Vercel Cron

1. **Ajoutez la variable d'environnement dans Vercel :**
   - Allez dans Vercel Dashboard → Votre projet → Settings → Environment Variables
   - Ajoutez : `RESET_SCANS_SECRET` avec une valeur générée :
     ```bash
     openssl rand -hex 32
     ```

2. **Le fichier `vercel-cron-config.json` est déjà créé** à la racine de votre projet

3. **Déployez votre projet** sur Vercel

4. **Vercel exécutera automatiquement** `/api/cron/reset-scans` le 1er de chaque mois à minuit UTC

### Test manuel

Pour tester immédiatement (sans attendre le 1er du mois) :

```bash
curl -X GET "https://votre-domaine.vercel.app/api/cron/reset-scans" \
  -H "Authorization: Bearer VOTRE_RESET_SCANS_SECRET"
```

Ou depuis Supabase SQL Editor :
```sql
SELECT reset_monthly_scans();
```

---

## Alternative : GitHub Actions

Si vous n'utilisez pas Vercel :

### Étape 1 : Créer la fonction SQL
Exécutez `supabase-reset-scans-cron.sql` dans Supabase SQL Editor.

### Étape 2 : Configurer GitHub Secrets

1. Allez dans votre repo GitHub → Settings → Secrets and variables → Actions
2. Ajoutez ces secrets :
   - `RESET_SCANS_SECRET` : générez avec `openssl rand -hex 32`
   - `SUPABASE_URL` : votre URL Supabase (ex: `https://xxxxx.supabase.co`)

### Étape 3 : Le workflow est déjà configuré

Le fichier `.github/workflows/reset-scans-monthly.yml` est déjà créé. Il s'exécutera automatiquement le 1er de chaque mois.

---

## Alternative : Service Externe (cron-job.org, etc.)

1. Créez la fonction SQL (exécutez `supabase-reset-scans-cron.sql`)
2. Créez un compte sur [cron-job.org](https://cron-job.org) ou un service similaire
3. Configurez un job qui appelle votre API Route :
   - URL : `https://votre-domaine.com/api/cron/reset-scans`
   - Méthode : GET
   - Header : `Authorization: Bearer VOTRE_RESET_SCANS_SECRET`
   - Schedule : Le 1er de chaque mois à minuit UTC

---

## Quelle option choisir ?

- **Vercel** → Utilisez l'API Route + Vercel Cron (le plus simple)
- **Autre hébergement** → Utilisez GitHub Actions
- **Pas de GitHub** → Utilisez un service externe comme cron-job.org

---

## Vérification

Pour vérifier que ça fonctionne, vous pouvez :

1. **Tester manuellement la fonction SQL :**
   ```sql
   SELECT reset_monthly_scans();
   ```

2. **Vérifier que les scans sont à 0 :**
   ```sql
   SELECT id, name, scans_this_month FROM restaurants;
   ```

3. **Tester l'API Route** (si vous utilisez Vercel) :
   ```bash
   curl -X GET "http://localhost:3000/api/cron/reset-scans" \
     -H "Authorization: Bearer votre-secret"
   ```

