# 🚀 Guide de Déploiement Vercel - Étape par Étape

## Étape 1 : Connecter GitHub à Vercel

1. **Allez sur [vercel.com](https://vercel.com)** et connectez-vous
2. Cliquez sur **"Add New..."** → **"Project"**
3. Cliquez sur **"Import Git Repository"**
4. Sélectionnez votre repo GitHub **restoboost**
5. Cliquez sur **"Import"**

---

## Étape 2 : Configurer le Projet

### Framework Preset
- Vercel devrait détecter automatiquement **Next.js**
- Si ce n'est pas le cas, sélectionnez **Next.js** manuellement

### Root Directory
- Laissez vide (ou mettez `.` si demandé)

### Build Command
- Laissez par défaut : `npm run build`

### Output Directory
- Laissez par défaut : `.next`

---

## Étape 3 : Configurer les Variables d'Environnement

**⚠️ IMPORTANT : Ne cliquez pas encore sur "Deploy" !**

Avant de déployer, configurez toutes les variables d'environnement :

### Dans la section "Environment Variables", ajoutez :

#### 1. Supabase
```
NEXT_PUBLIC_SUPABASE_URL = votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY = votre_anon_key
SUPABASE_SERVICE_ROLE_KEY = votre_service_role_key
```

#### 2. Stripe
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = votre_publishable_key
STRIPE_SECRET_KEY = votre_secret_key
STRIPE_WEBHOOK_SECRET = votre_webhook_secret
STRIPE_PRO_PRICE_ID = price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID = price_xxxxx
```

#### 3. Resend
```
RESEND_API_KEY = votre_resend_key
```

#### 4. Application
```
NEXT_PUBLIC_URL = https://votre-projet.vercel.app
```
*(Vous pourrez mettre votre domaine personnalisé plus tard)*

#### 5. ⭐ NOUVEAU : Secret pour le Cron Job
```
RESET_SCANS_SECRET = votre_secret_aleatoire
```

**Pour générer RESET_SCANS_SECRET :**
- Option 1 : `openssl rand -hex 32` (en ligne de commande)
- Option 2 : https://randomkeygen.com/ (utilisez "CodeIgniter Encryption Keys")
- Option 3 : N'importe quelle chaîne aléatoire de 32+ caractères

**💡 Astuce :** Vous pouvez copier-coller depuis votre `.env.local` local si vous l'avez déjà configuré.

---

## Étape 4 : Déployer

1. **Vérifiez que toutes les variables sont ajoutées**
2. Cliquez sur **"Deploy"**
3. Attendez que le déploiement se termine (2-3 minutes)

---

## Étape 5 : Vérifier le Déploiement

Une fois le déploiement terminé :

1. **Vercel vous donnera une URL** : `https://votre-projet.vercel.app`
2. **Testez l'application** :
   - Ouvrez l'URL dans votre navigateur
   - Vérifiez que la landing page s'affiche
   - Testez la création de compte

---

## Étape 6 : Vérifier le Cron Job

1. **Dans Vercel Dashboard** → Votre projet → **Settings** → **Cron Jobs**
2. Vous devriez voir :
   ```
   reset-scans
   Schedule: 0 0 1 * * (Le 1er de chaque mois à minuit UTC)
   Path: /api/cron/reset-scans
   ```

**Si le cron job n'apparaît pas :**
- Vérifiez que `vercel-cron-config.json` est bien à la racine du projet
- Redéployez le projet

---

## Étape 7 : Tester le Cron Job

### Test 1 : Vérifier que la fonction SQL existe

Dans **Supabase SQL Editor**, exécutez :
```sql
SELECT reset_monthly_scans();
```

Cela devrait réinitialiser tous les scans sans erreur.

### Test 2 : Tester l'API Route

**Depuis votre terminal :**
```bash
curl -X GET "https://votre-projet.vercel.app/api/cron/reset-scans" \
  -H "Authorization: Bearer VOTRE_RESET_SCANS_SECRET"
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Scans réinitialisés avec succès",
  "restaurants_updated": 0,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Si vous obtenez "Unauthorized" :**
- Vérifiez que `RESET_SCANS_SECRET` est bien configuré dans Vercel
- Vérifiez que vous utilisez le bon secret dans le header

---

## Étape 8 : Mettre à jour NEXT_PUBLIC_URL (Important)

Après le premier déploiement :

1. **Copiez l'URL de votre projet Vercel** : `https://votre-projet.vercel.app`
2. **Dans Vercel Dashboard** → Settings → Environment Variables
3. **Modifiez** `NEXT_PUBLIC_URL` avec votre URL Vercel
4. **Redéployez** (ou attendez le prochain déploiement)

**Pourquoi ?** Cette URL est utilisée pour générer les QR codes et les liens de review.

---

## Étape 9 : Configurer le Webhook Stripe (Si pas déjà fait)

1. **Dans Stripe Dashboard** → Developers → Webhooks
2. **Ajoutez un endpoint** : `https://votre-projet.vercel.app/api/stripe/webhook`
3. **Sélectionnez les événements** :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
4. **Copiez le secret du webhook** et mettez-le dans `STRIPE_WEBHOOK_SECRET` dans Vercel

---

## ✅ Checklist Finale

- [ ] Repo GitHub créé et connecté à Vercel
- [ ] Toutes les variables d'environnement configurées dans Vercel
- [ ] Projet déployé avec succès
- [ ] Cron job visible dans Vercel Dashboard
- [ ] Fonction SQL `reset_monthly_scans()` exécutée dans Supabase
- [ ] API Route testée avec curl
- [ ] `NEXT_PUBLIC_URL` mis à jour avec l'URL Vercel
- [ ] Webhook Stripe configuré (si applicable)

---

## 🐛 Dépannage Rapide

### Le déploiement échoue
- Vérifiez les logs dans Vercel Dashboard → Deployments
- Vérifiez que toutes les variables d'environnement sont bien configurées

### Le cron job n'apparaît pas
- Vérifiez que `vercel-cron-config.json` est à la racine
- Redéployez le projet

### Erreur "Unauthorized" lors du test
- Vérifiez `RESET_SCANS_SECRET` dans Vercel
- Vérifiez le format du header : `Bearer votre-secret`

### Les QR codes ne fonctionnent pas
- Vérifiez que `NEXT_PUBLIC_URL` est bien configuré avec votre URL Vercel
- Redéployez après avoir modifié `NEXT_PUBLIC_URL`

---

## 📞 Besoin d'aide ?

Si vous rencontrez un problème :
1. Vérifiez les logs dans Vercel Dashboard
2. Vérifiez les logs dans Supabase Dashboard
3. Testez chaque composant individuellement (API Route, fonction SQL, etc.)

---

## 🎉 Félicitations !

Une fois tout configuré, votre application est en production et le cron job réinitialisera automatiquement les scans le 1er de chaque mois !

