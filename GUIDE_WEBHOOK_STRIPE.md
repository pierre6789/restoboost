# Guide : Configuration du Webhook Stripe

## 🎯 À quoi sert le Webhook ?

Le webhook permet à Stripe de **notifier automatiquement votre application** quand :
- ✅ Un paiement est effectué (`checkout.session.completed`)
- ✅ Un abonnement est mis à jour (`customer.subscription.updated`)
- ✅ Un abonnement est annulé (`customer.subscription.deleted`)
- ⚠️ Un paiement échoue (`invoice.payment_failed`)
- ✅ Un paiement réussit (`invoice.payment_succeeded`)

**Sans le webhook**, votre application ne saurait pas qu'un utilisateur a payé, et son plan ne serait pas mis à jour automatiquement !

## 📋 Étapes de Configuration

### Étape 1 : Créer le Webhook dans Stripe

1. Allez sur votre [Dashboard Stripe](https://dashboard.stripe.com/)
2. Allez dans **Développeurs** (Developers) > **Webhooks** (en haut à droite)
3. Cliquez sur **Ajouter un point de terminaison** (Add endpoint)

### Étape 2 : Configurer l'URL du Webhook

**Pour la production** (une fois déployé sur Vercel) :
```
https://restorise.fr/api/stripe/webhook
```

**Pour tester en local** (avec Stripe CLI) :
- Vous pouvez utiliser `stripe listen` pour tester localement
- Ou utilisez l'URL de votre déploiement Vercel en preview

**Important** : Pour l'instant, utilisez l'URL de production même si vous testez, car Stripe doit pouvoir accéder à votre serveur.

### Étape 3 : Sélectionner les Événements

Dans la section **Événements à écouter** (Events to send), sélectionnez ces 5 événements :

- ✅ `checkout.session.completed` - Quand un paiement est complété
- ✅ `customer.subscription.updated` - Quand un abonnement est modifié
- ✅ `customer.subscription.deleted` - Quand un abonnement est annulé
- ✅ `invoice.payment_failed` - Quand un paiement échoue
- ✅ `invoice.payment_succeeded` - Quand un paiement réussit

### Étape 4 : Récupérer le Secret du Webhook

1. Après avoir créé le webhook, cliquez dessus dans la liste
2. Dans la section **Signing secret** (en haut de la page)
3. Cliquez sur **Révéler** (Reveal) ou **Cliquer pour révéler**
4. **Copiez le secret** (il commence par `whsec_...`)
   - Exemple : `whsec_1ABC123def456GHI789jkl`

⚠️ **Important** : Ce secret est différent pour chaque webhook. Si vous créez un nouveau webhook, vous aurez un nouveau secret.

### Étape 5 : Ajouter le Secret dans les Variables d'Environnement

#### En Local (`.env.local`)

Ajoutez cette ligne dans votre fichier `.env.local` :

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Remplacez `whsec_xxxxx`** par le secret que vous avez copié.

#### Sur Vercel

1. Allez sur votre projet Vercel
2. Allez dans **Settings** > **Environment Variables**
3. Ajoutez ou modifiez :
   - **Name** : `STRIPE_WEBHOOK_SECRET`
   - **Value** : Le secret que vous avez copié (commence par `whsec_...`)
4. **Important** : Sélectionnez tous les environnements (Production, Preview, Development)
5. Cliquez sur **Save**

### Étape 6 : Redémarrer votre Application

Après avoir ajouté le secret :
- **En local** : Redémarrez votre serveur (`npm run dev`)
- **Sur Vercel** : Redéployez votre application (ou attendez le prochain push)

## ✅ Vérifier que ça Fonctionne

### Test 1 : Vérifier dans Stripe Dashboard

1. Allez dans **Développeurs** > **Webhooks**
2. Cliquez sur votre webhook
3. Allez dans l'onglet **Événements envoyés** (Events sent)
4. Après un paiement test, vous devriez voir les événements envoyés
5. Vérifiez que les événements sont marqués comme **Succès** (200) et non **Échec**

### Test 2 : Tester un Paiement

1. Allez sur votre site : `/pricing`
2. Cliquez sur "S'abonner" pour un plan
3. Utilisez une carte de test Stripe : `4242 4242 4242 4242`
4. Complétez le paiement
5. Vérifiez que :
   - Vous êtes redirigé vers `/dashboard/billing?success=true`
   - Votre plan est mis à jour dans le dashboard
   - Les événements apparaissent dans Stripe Dashboard > Webhooks

### Test 3 : Vérifier les Logs

Si quelque chose ne fonctionne pas :
- **Vercel** : Allez dans votre projet > **Deployments** > Cliquez sur un déploiement > **Functions** > Cherchez les logs de `/api/stripe/webhook`
- **Local** : Regardez les logs de votre terminal

## 🔍 Dépannage

### Problème : "Webhook signature verification failed"

- Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
- Vérifiez que vous utilisez le bon secret (celui du webhook que vous avez créé)
- Vérifiez que le secret n'a pas d'espaces avant/après

### Problème : "No events received" dans Stripe Dashboard

- Vérifiez que l'URL du webhook est correcte : `https://restorise.fr/api/stripe/webhook`
- Vérifiez que votre site est bien déployé et accessible
- Vérifiez que les événements sont bien sélectionnés dans la configuration du webhook

### Problème : Les événements sont envoyés mais échouent (500)

- Vérifiez les logs de Vercel pour voir l'erreur exacte
- Vérifiez que toutes les variables d'environnement sont bien configurées
- Vérifiez que la route `/api/stripe/webhook` existe et fonctionne

## 📝 Checklist

- [ ] Webhook créé dans Stripe Dashboard
- [ ] URL configurée : `https://restorise.fr/api/stripe/webhook`
- [ ] 5 événements sélectionnés
- [ ] Secret du webhook copié
- [ ] `STRIPE_WEBHOOK_SECRET` ajouté dans `.env.local`
- [ ] `STRIPE_WEBHOOK_SECRET` ajouté dans Vercel
- [ ] Application redémarrée/redéployée
- [ ] Test de paiement effectué avec succès
- [ ] Événements visibles dans Stripe Dashboard

## 🎯 Résumé Rapide

1. **Créer le webhook** dans Stripe Dashboard > Développeurs > Webhooks
2. **URL** : `https://restorise.fr/api/stripe/webhook`
3. **Événements** : Sélectionner les 5 événements listés ci-dessus
4. **Copier le secret** (commence par `whsec_...`)
5. **Ajouter dans `.env.local`** : `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`
6. **Ajouter dans Vercel** : Même chose dans Environment Variables
7. **Tester** : Faire un paiement test et vérifier que ça fonctionne

Une fois configuré, votre application sera automatiquement notifiée à chaque événement Stripe ! 🎉

