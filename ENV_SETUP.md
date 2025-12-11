# Configuration des Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
# Price IDs for subscription plans (Monthly)
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx
# Price IDs for subscription plans (Yearly)
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_xxxxx

# Resend Configuration
RESEND_API_KEY=your_resend_api_key

# Application Configuration
NEXT_PUBLIC_URL=http://localhost:3000

# Optional: Secret for reset scans cron job (generate with: openssl rand -hex 32)
# Only needed if using Vercel Cron or GitHub Actions for monthly reset
# RESET_SCANS_SECRET=your-secret-key-here
```

## Instructions

1. **Supabase** : 
   - Créez un projet sur [supabase.com](https://supabase.com)
   - Exécutez le fichier `supabase-schema.sql` dans l'éditeur SQL
   - **IMPORTANT** : Exécutez également le fichier `supabase-functions.sql` pour créer la fonction nécessaire à la création automatique des restaurants

2. **Stripe** : 
   - Créez un compte sur [stripe.com](https://stripe.com)
   - Récupérez vos clés API dans le dashboard Stripe
   - Créez des produits/prix pour vos plans d'abonnement (Pro, Enterprise)
   - Configurez un webhook pointant vers `https://votre-domaine.com/api/stripe/webhook`
   - Sélectionnez les événements : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`
   - Copiez le secret du webhook dans `STRIPE_WEBHOOK_SECRET`

3. **Resend** : Créez un compte sur [resend.com](https://resend.com) et générez une clé API.

4. **NEXT_PUBLIC_URL** : Pour la production, remplacez par l'URL de votre domaine.

