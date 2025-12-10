# Guide de Déploiement Vercel + Configuration Cron

## 📋 Checklist avant déploiement

### 1. Variables d'environnement à configurer dans Vercel

Avant de déployer, assurez-vous d'avoir toutes ces variables dans Vercel :

**Dans Vercel Dashboard → Votre Projet → Settings → Environment Variables :**

```env
# Supabase (déjà configuré normalement)
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Stripe (déjà configuré normalement)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=votre_publishable_key
STRIPE_SECRET_KEY=votre_secret_key
STRIPE_WEBHOOK_SECRET=votre_webhook_secret
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx

# Resend (déjà configuré normalement)
RESEND_API_KEY=votre_resend_key

# Application
NEXT_PUBLIC_URL=https://votre-domaine.vercel.app

# ⭐ NOUVEAU : Secret pour le cron job de réinitialisation
RESET_SCANS_SECRET=votre_secret_aleatoire_ici
```

### 2. Générer le secret RESET_SCANS_SECRET

Générez une clé secrète aléatoire :

**Option A : En ligne de commande**
```bash
openssl rand -hex 32
```

**Option B : En ligne**
- Allez sur https://randomkeygen.com/
- Utilisez une "CodeIgniter Encryption Keys" (64 caractères)

**Option C : Simple**
- Utilisez n'importe quelle chaîne aléatoire de 32+ caractères
- Exemple : `restoboost-reset-scans-2024-secret-key-xyz123`

---

## 🚀 Étape 1 : Déployer sur Vercel

1. **Connectez votre repo GitHub à Vercel** (si pas déjà fait)
   - Allez sur https://vercel.com
   - Importez votre projet

2. **Configurez les variables d'environnement** (voir ci-dessus)

3. **Déployez** - Vercel détectera automatiquement le fichier `vercel-cron-config.json`

---

## ✅ Étape 2 : Vérifier que le Cron est configuré

Après le déploiement :

1. **Allez dans Vercel Dashboard → Votre Projet → Settings → Cron Jobs**
2. Vous devriez voir un job nommé `reset-scans` qui s'exécute le 1er de chaque mois

Si vous ne voyez pas le cron job :
- Vérifiez que `vercel-cron-config.json` est bien à la racine du projet
- Redéployez le projet

---

## 🧪 Étape 3 : Tester la réinitialisation

### Test 1 : Tester la fonction SQL directement

Dans Supabase SQL Editor :
```sql
-- Vérifier les scans actuels
SELECT id, name, scans_this_month FROM restaurants;

-- Réinitialiser manuellement
SELECT reset_monthly_scans();

-- Vérifier que ça a fonctionné
SELECT id, name, scans_this_month FROM restaurants;
```

### Test 2 : Tester l'API Route

**Depuis votre terminal :**
```bash
curl -X GET "https://votre-domaine.vercel.app/api/cron/reset-scans" \
  -H "Authorization: Bearer VOTRE_RESET_SCANS_SECRET"
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Scans réinitialisés avec succès",
  "restaurants_updated": 5,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Si vous obtenez "Unauthorized" :**
- Vérifiez que `RESET_SCANS_SECRET` est bien configuré dans Vercel
- Vérifiez que vous utilisez le bon secret dans le header Authorization

### Test 3 : Simuler le cron manuellement

Dans Vercel Dashboard :
1. Allez dans votre projet → Settings → Cron Jobs
2. Cliquez sur le job `reset-scans`
3. Cliquez sur "Run Now" (si disponible)

---

## 📅 Étape 4 : Vérifier le planning

Le cron job est configuré pour s'exécuter :
- **Quand :** Le 1er de chaque mois à minuit UTC
- **Route :** `/api/cron/reset-scans`
- **Méthode :** GET

**Note :** Si vous êtes dans un fuseau horaire différent, le "minuit UTC" peut être à une heure différente de votre heure locale.

---

## 🔍 Étape 5 : Monitoring

### Vérifier les logs

1. **Dans Vercel Dashboard → Votre Projet → Logs**
2. Filtrez par "Cron" pour voir les exécutions du cron job
3. Vérifiez qu'il n'y a pas d'erreurs

### Vérifier dans Supabase

Après le 1er du mois, vérifiez que les scans sont bien réinitialisés :
```sql
SELECT 
  id, 
  name, 
  scans_this_month,
  updated_at
FROM restaurants
ORDER BY updated_at DESC;
```

---

## 🐛 Dépannage

### Le cron ne s'exécute pas

1. **Vérifiez que `vercel-cron-config.json` est à la racine** (pas dans un sous-dossier)
2. **Vérifiez la syntaxe JSON** du fichier
3. **Redéployez** le projet
4. **Vérifiez les logs** dans Vercel Dashboard

### Erreur "Unauthorized"

1. Vérifiez que `RESET_SCANS_SECRET` est bien configuré dans Vercel
2. Vérifiez que vous utilisez `Bearer` dans le header :
   ```
   Authorization: Bearer votre-secret
   ```

### Erreur 500 dans les logs

1. Vérifiez que la fonction SQL `reset_monthly_scans()` existe dans Supabase
2. Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est bien configuré
3. Vérifiez les logs détaillés dans Vercel

---

## 📝 Résumé

1. ✅ Exécutez `supabase-reset-scans-cron.sql` dans Supabase (crée la fonction)
2. ✅ Ajoutez `RESET_SCANS_SECRET` dans Vercel Environment Variables
3. ✅ Déployez sur Vercel
4. ✅ Vérifiez que le cron job apparaît dans Vercel Dashboard
5. ✅ Testez manuellement l'API Route
6. ✅ Attendez le 1er du mois ou testez avec "Run Now"

---

## 🎯 Prochaines étapes après déploiement

Une fois que tout est déployé et testé :

1. **Marquez dans votre calendrier** : Le 1er de chaque mois, vérifiez que les scans sont réinitialisés
2. **Configurez une alerte** (optionnel) : Créez une notification pour vous rappeler de vérifier
3. **Documentez** : Notez dans votre équipe que les scans se réinitialisent automatiquement

---

## 💡 Astuce

Pour tester immédiatement sans attendre le 1er du mois, vous pouvez :

1. **Modifier temporairement** `vercel-cron-config.json` pour exécuter dans 5 minutes :
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/reset-scans",
         "schedule": "*/5 * * * *"
       }
     ]
   }
   ```
   (S'exécute toutes les 5 minutes - **à remettre en place après le test !**)

2. **Ou utiliser** l'API Route directement avec curl (voir Test 2 ci-dessus)

