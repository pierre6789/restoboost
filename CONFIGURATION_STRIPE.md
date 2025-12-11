# Configuration Stripe - Guide Complet

## ✅ Étape 1 : Récupérer les Price IDs

1. Allez sur votre [Dashboard Stripe](https://dashboard.stripe.com/)
2. Allez dans **Produits** (Products)
3. Pour chaque produit (Pro et Enterprise), vous devez créer **2 prix** :
   - **Un prix mensuel** (billing period: Monthly)
   - **Un prix annuel** (billing period: Yearly)
   
   Pour chaque prix :
   - Cliquez sur le produit
   - Cliquez sur **Ajouter un prix** (Add price)
   - Configurez :
     - **Prix** : Le montant (ex: 29€ pour Pro mensuel, 279€ pour Pro annuel)
     - **Période de facturation** : Mensuel ou Annuel
     - **Type de facturation** : Récurrent
   - Copiez le **Price ID** (commence par `price_...`)
   - Exemple : `price_1ABC123def456GHI789jkl`

**Vous aurez donc 4 Price IDs au total** :
- Pro Mensuel
- Pro Annuel
- Enterprise Mensuel
- Enterprise Annuel

## ✅ Étape 2 : Ajouter les Price IDs dans les Variables d'Environnement

### En Local (`.env.local`)

Ajoutez ou modifiez ces lignes dans votre fichier `.env.local` :

```env
# Prix mensuels
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx

# Prix annuels
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_xxxxx
```

**Remplacez `price_xxxxx`** par les vrais Price IDs que vous avez copiés.

### Sur Vercel

1. Allez sur votre projet Vercel
2. Allez dans **Settings** > **Environment Variables**
3. Ajoutez ou modifiez :
   - `STRIPE_PRO_PRICE_ID` = votre Price ID Pro Mensuel
   - `STRIPE_ENTERPRISE_PRICE_ID` = votre Price ID Enterprise Mensuel
   - `STRIPE_PRO_YEARLY_PRICE_ID` = votre Price ID Pro Annuel
   - `STRIPE_ENTERPRISE_YEARLY_PRICE_ID` = votre Price ID Enterprise Annuel
4. **Important** : Sélectionnez tous les environnements (Production, Preview, Development)
5. Cliquez sur **Save**

## ✅ Étape 3 : Configurer le Webhook Stripe

Le webhook permet à Stripe de notifier votre application quand un paiement est effectué ou annulé.

### 3.1 Créer le Webhook

1. Dans le Dashboard Stripe, allez dans **Développeurs** (Developers) > **Webhooks**
2. Cliquez sur **Ajouter un point de terminaison** (Add endpoint)
3. **URL du point de terminaison** :
   ```
   https://restorise.fr/api/stripe/webhook
   ```
   (Pour tester en local, utilisez : `https://votre-projet.vercel.app/api/stripe/webhook`)
4. **Événements à écouter** : Sélectionnez ces événements :
   - `checkout.session.completed` ✅
   - `customer.subscription.updated` ✅
   - `customer.subscription.deleted` ✅
   - `invoice.payment_failed` ✅
   - `invoice.payment_succeeded` ✅
5. Cliquez sur **Ajouter un point de terminaison**

### 3.2 Récupérer le Secret du Webhook

1. Après avoir créé le webhook, cliquez dessus
2. Dans la section **Signing secret**, cliquez sur **Révéler** (Reveal)
3. Copiez le secret (commence par `whsec_...`)

### 3.3 Ajouter le Secret dans les Variables d'Environnement

**En Local (`.env.local`)** :
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Sur Vercel** :
1. Allez dans **Settings** > **Environment Variables**
2. Ajoutez ou modifiez `STRIPE_WEBHOOK_SECRET` avec le secret copié
3. Sélectionnez tous les environnements
4. Cliquez sur **Save**

## ✅ Étape 4 : Vérifier les Clés API Stripe

Assurez-vous d'avoir ces variables d'environnement configurées :

```env
# Clés API Stripe (récupérables dans Developers > API keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx (ou pk_live_xxxxx)
STRIPE_SECRET_KEY=sk_test_xxxxx (ou sk_live_xxxxx)

# Price IDs Mensuels (que vous venez de créer)
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx

# Price IDs Annuels (que vous venez de créer)
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_xxxxx

# Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## ✅ Étape 5 : Tester la Configuration

### Test en Local

1. Redémarrez votre serveur de développement :
   ```bash
   npm run dev
   ```

2. Connectez-vous à votre application
3. Allez sur `/pricing`
4. Cliquez sur "Choisir le plan Pro" ou "Choisir le plan Enterprise"
5. Vous devriez être redirigé vers Stripe Checkout

### Test du Webhook

1. Dans Stripe Dashboard, allez dans **Développeurs** > **Webhooks**
2. Cliquez sur votre webhook
3. Allez dans l'onglet **Événements envoyés** (Events sent)
4. Après un paiement test, vous devriez voir les événements envoyés
5. Vérifiez que les événements sont marqués comme **Succès** (200)

### Test avec une Carte de Test

Stripe fournit des cartes de test :
- **Carte valide** : `4242 4242 4242 4242`
- **Date d'expiration** : N'importe quelle date future (ex: 12/25)
- **CVC** : N'importe quel 3 chiffres (ex: 123)
- **Code postal** : N'importe quel code postal (ex: 12345)

## ✅ Étape 6 : Passer en Mode Production

Quand vous êtes prêt pour la production :

1. **Dans Stripe Dashboard** :
   - Basculez en mode **Live** (en haut à droite)
   - Créez les mêmes produits/prix en mode Live
   - Créez un nouveau webhook avec l'URL de production
   - Récupérez les nouvelles clés API Live

2. **Mettez à jour les variables d'environnement sur Vercel** :
   - Remplacez les clés `test` par les clés `live`
   - Remplacez les Price IDs de test par ceux de production
   - Mettez à jour le `STRIPE_WEBHOOK_SECRET` avec le secret du webhook Live

## 🔍 Dépannage

### Problème : "Price ID requis" ou erreur lors du checkout

- Vérifiez que tous les Price IDs sont bien définis (mensuels ET annuels)
- Vérifiez que les Price IDs sont corrects (commencent par `price_`)
- Vérifiez que vous avez créé les 4 prix dans Stripe (2 pour Pro, 2 pour Enterprise)
- Redémarrez votre serveur après avoir modifié `.env.local`

### Problème : Le webhook ne fonctionne pas

- Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
- Vérifiez que l'URL du webhook est correcte : `https://restorise.fr/api/stripe/webhook`
- Vérifiez les logs dans Stripe Dashboard > Webhooks > Votre webhook > Événements envoyés
- Vérifiez les logs de Vercel pour voir les erreurs éventuelles

### Problème : Le plan ne se met pas à jour après paiement

- Vérifiez que le webhook est bien configuré et actif
- Vérifiez que les événements sont bien sélectionnés
- Vérifiez les logs du webhook dans Stripe Dashboard
- Vérifiez que `STRIPE_WEBHOOK_SECRET` correspond au bon webhook (test ou live)

## 📝 Checklist de Configuration

- [ ] Produits créés sur Stripe (Pro et Enterprise)
- [ ] **4 Prix créés** : Pro Mensuel, Pro Annuel, Enterprise Mensuel, Enterprise Annuel
- [ ] Price IDs mensuels récupérés et ajoutés dans `.env.local`
- [ ] Price IDs annuels récupérés et ajoutés dans `.env.local`
- [ ] Tous les Price IDs ajoutés dans Vercel (Environment Variables)
- [ ] Webhook créé avec l'URL correcte
- [ ] Événements webhook sélectionnés (5 événements)
- [ ] `STRIPE_WEBHOOK_SECRET` ajouté dans `.env.local`
- [ ] `STRIPE_WEBHOOK_SECRET` ajouté dans Vercel
- [ ] Test de checkout mensuel effectué avec succès
- [ ] Test de checkout annuel effectué avec succès
- [ ] Test du webhook vérifié dans Stripe Dashboard

Une fois toutes ces étapes complétées, votre intégration Stripe sera fonctionnelle ! 🎉

