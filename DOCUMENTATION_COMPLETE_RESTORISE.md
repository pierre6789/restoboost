# Documentation Technique Complète - RestoRise

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Technique](#architecture-technique)
3. [Structure du Projet](#structure-du-projet)
4. [Base de Données](#base-de-données)
5. [Routes et Pages](#routes-et-pages)
6. [Composants](#composants)
7. [Server Actions](#server-actions)
8. [API Routes](#api-routes)
9. [Authentification](#authentification)
10. [Paiements (Stripe)](#paiements-stripe)
11. [Feature Gating](#feature-gating)
12. [Intégrations](#intégrations)
13. [Déploiement](#déploiement)
14. [Sécurité](#sécurité)

---

## 1. Vue d'Ensemble

### 1.1 Description
RestoRise est une application SaaS de gestion de réputation pour restaurants construite avec Next.js 14, TypeScript, Supabase, et Stripe.

### 1.2 Stack Technique

#### Frontend
- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS 4
- **Composants UI** : Shadcn/UI (Radix UI)
- **Icons** : Lucide React
- **QR Codes** : qrcode.react
- **Notifications** : Sonner

#### Backend
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **Paiements** : Stripe
- **Email** : Resend
- **Server Actions** : Next.js Server Actions

#### Infrastructure
- **Hébergement** : Vercel
- **Cron Jobs** : Vercel Cron
- **CDN** : Vercel Edge Network

### 1.3 Fonctionnalités Principales

1. **Génération de QR Codes** : QR codes dynamiques pour chaque restaurant
2. **Page de Review Publique** : Interface pour les clients
3. **Redirection Intelligente** : 4-5 étoiles → Google Maps, 1-3 étoiles → Feedback
4. **Dashboard Propriétaire** : Statistiques, feedbacks, analytics
5. **Gestion du Personnel** : QR codes individuels, suivi des performances
6. **Multi-Restaurants** : Gestion de plusieurs restaurants (Enterprise)
7. **Feature Gating** : Plans Free, Pro, Enterprise avec limitations
8. **Paiements** : Abonnements Stripe (mensuel/annuel)

---

## 2. Architecture Technique

### 2.1 Architecture Générale

```
┌─────────────────┐
│   Client Web    │
│  (Next.js App)  │
└────────┬────────┘
         │
         ├─── Server Actions (Mutations)
         ├─── API Routes (Webhooks, Cron)
         │
┌────────▼────────┐
│   Supabase      │
│  - PostgreSQL   │
│  - Auth         │
│  - RLS          │
└────────┬────────┘
         │
┌────────▼────────┐
│   Services      │
│  - Stripe       │
│  - Resend       │
└─────────────────┘
```

### 2.2 Flux de Données

#### Flux 1 : Scan QR Code → Review
1. Client scanne QR code
2. Redirection vers `/review/[slug]`
3. Log de l'événement "scan"
4. Incrémentation `scans_this_month`
5. Affichage du formulaire de notation

#### Flux 2 : Notation → Redirection/Feedback
1. Client note (1-5 étoiles)
2. Si 4-5 étoiles :
   - Log "positive_redirect"
   - Redirection vers Google Maps
3. Si 1-3 étoiles :
   - Affichage formulaire feedback
   - Soumission → DB + Email (si Pro/Enterprise)
   - Log "negative_feedback"

#### Flux 3 : Paiement → Activation
1. Client clique "S'abonner" sur `/pricing`
2. Redirection vers Stripe Checkout
3. Paiement réussi
4. Webhook Stripe → Mise à jour `profiles.plan`
5. Redirection vers dashboard avec plan activé

---

## 3. Structure du Projet

### 3.1 Arborescence

```
restoboost/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Page de connexion
│   │   ├── signup/            # Page d'inscription
│   │   ├── pricing/           # Page tarifs
│   │   ├── dashboard/         # Dashboard (protégé)
│   │   │   ├── page.tsx       # Dashboard principal
│   │   │   ├── settings/      # Paramètres restaurant
│   │   │   └── billing/       # Gestion abonnement
│   │   ├── review/[slug]/     # Page publique de review
│   │   ├── actions.ts         # Server Actions
│   │   ├── auth-actions.ts    # Actions d'authentification
│   │   └── api/               # API Routes
│   │       ├── stripe/        # Webhooks Stripe
│   │       ├── cron/          # Jobs cron
│   │       └── admin/         # Actions admin (dev)
│   ├── components/            # Composants React
│   │   ├── ui/                # Composants Shadcn/UI
│   │   ├── dashboard-stats.tsx
│   │   ├── feedback-list.tsx
│   │   ├── qrcode-section.tsx
│   │   ├── review-form.tsx
│   │   ├── staff-management.tsx
│   │   ├── advanced-analytics.tsx
│   │   └── ...
│   └── lib/                   # Utilitaires
│       ├── supabase/          # Clients Supabase
│       ├── stripe.ts          # Client Stripe
│       ├── resend.ts          # Client Resend
│       └── qrcode-utils.ts    # Utilitaires QR codes
├── public/                    # Assets statiques
├── supabase/                  # Scripts SQL
├── middleware.ts              # Middleware Next.js
└── package.json
```

### 3.2 Fichiers Clés

#### Configuration
- `package.json` : Dépendances et scripts
- `tsconfig.json` : Configuration TypeScript
- `next.config.ts` : Configuration Next.js
- `tailwind.config.js` : Configuration Tailwind
- `middleware.ts` : Protection des routes

#### Base de Données
- `supabase-schema.sql` : Schéma initial
- `supabase-feature-gating-migration.sql` : Migration feature gating
- `supabase-functions.sql` : Fonctions SQL
- `supabase-reset-scans-cron.sql` : Fonction reset scans

#### Documentation
- `ENV_SETUP.md` : Configuration variables d'environnement
- `CONFIGURATION_STRIPE.md` : Configuration Stripe
- `CONFIGURATION_GOOGLE_OAUTH.md` : Configuration OAuth
- `GUIDE_DEPLOIEMENT_VERCEL.md` : Guide déploiement

---

## 4. Base de Données

### 4.1 Schéma Complet

#### Table `profiles`
```sql
- id (UUID, PK, FK → auth.users)
- email (TEXT)
- subscription_status (TEXT: 'free'|'active'|'canceled'|'past_due')
- plan_type (TEXT: 'free'|'pro'|'enterprise')
- plan (TEXT: 'free'|'pro'|'enterprise')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### Table `restaurants`
```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles.id)
- name (TEXT)
- slug (TEXT, UNIQUE)
- google_maps_url (TEXT, NULLABLE)
- logo_url (TEXT, NULLABLE)
- scans_this_month (INTEGER, DEFAULT 0)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### Table `events`
```sql
- id (UUID, PK)
- restaurant_id (UUID, FK → restaurants.id)
- type (ENUM: 'scan'|'positive_redirect'|'negative_feedback')
- created_at (TIMESTAMP)
```

#### Table `feedback`
```sql
- id (UUID, PK)
- restaurant_id (UUID, FK → restaurants.id)
- rating (INTEGER, 1-3)
- comment (TEXT, NULLABLE)
- contact_email (TEXT, NULLABLE)
- created_at (TIMESTAMP)
```

#### Table `staff_members`
```sql
- id (UUID, PK)
- restaurant_id (UUID, FK → restaurants.id)
- name (TEXT)
- total_scans (INTEGER, DEFAULT 0)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 4.2 Row Level Security (RLS)

#### Politiques Principales

**profiles**
- SELECT : Utilisateur peut voir son propre profil
- UPDATE : Utilisateur peut mettre à jour son propre profil

**restaurants**
- SELECT : Utilisateur peut voir ses restaurants + accès public par slug
- INSERT : Utilisateur peut créer ses restaurants
- UPDATE : Utilisateur peut mettre à jour ses restaurants
- DELETE : Utilisateur peut supprimer ses restaurants

**events**
- SELECT : Utilisateur peut voir les événements de ses restaurants
- INSERT : Accès public (pour page de review)

**feedback**
- SELECT : Utilisateur peut voir les feedbacks de ses restaurants
- INSERT : Accès public (pour page de review)

**staff_members**
- SELECT/INSERT/UPDATE/DELETE : Utilisateur peut gérer le personnel de ses restaurants

### 4.3 Index

- `idx_restaurants_user_id` : Recherche rapide par utilisateur
- `idx_restaurants_slug` : Recherche rapide par slug (unique)
- `idx_events_restaurant_id` : Agrégations par restaurant
- `idx_events_created_at` : Filtrage temporel
- `idx_feedback_restaurant_id` : Recherche feedbacks
- `idx_staff_members_restaurant_id` : Recherche personnel

### 4.4 Triggers

#### `handle_new_user()`
- **Déclencheur** : Après INSERT sur `auth.users`
- **Action** : Crée automatiquement un profil dans `profiles`

#### `update_updated_at_column()`
- **Déclencheur** : Avant UPDATE sur `profiles`, `restaurants`, `staff_members`
- **Action** : Met à jour `updated_at` automatiquement

---

## 5. Routes et Pages

### 5.1 Routes Publiques

#### `/` (Landing Page)
- **Fichier** : `src/app/page.tsx`
- **Description** : Page d'accueil avec présentation du produit
- **Composants** : Navbar, Hero, Features, Stats, CTA
- **Authentification** : Redirige vers `/dashboard` si connecté

#### `/login`
- **Fichier** : `src/app/login/page.tsx`
- **Description** : Page de connexion
- **Composants** : Navbar, LoginForm
- **Authentification** : Redirige vers `/dashboard` si connecté

#### `/signup`
- **Fichier** : `src/app/signup/page.tsx`
- **Description** : Page d'inscription
- **Composants** : Navbar, SignupForm
- **Authentification** : Redirige vers `/dashboard` si connecté

#### `/pricing`
- **Fichier** : `src/app/pricing/page.tsx`
- **Description** : Page des tarifs
- **Composants** : Navbar, PricingPageClient, PricingCard
- **Fonctionnalités** : Toggle mensuel/annuel, affichage plan actuel

#### `/review/[slug]`
- **Fichier** : `src/app/review/[slug]/page.tsx`
- **Description** : Page publique de review
- **Composants** : ReviewForm
- **Fonctionnalités** :
  - Log du scan
  - Incrémentation `scans_this_month`
  - Feature gating (limite 30 scans pour Free)
  - Support `staff_id` query param
  - Affichage branding (Free uniquement)

### 5.2 Routes Protégées (Dashboard)

#### `/dashboard`
- **Fichier** : `src/app/dashboard/page.tsx`
- **Description** : Dashboard principal
- **Protection** : Middleware + vérification serveur
- **Composants** :
  - RestaurantSelector (Enterprise/multi-restaurants)
  - DashboardStats
  - Tabs (Feedback, Analytics, Personnel, Support, QR Code)
  - FeedbackList
  - AdvancedAnalytics (Pro/Enterprise)
  - StaffManagement (Pro/Enterprise)
  - PrioritySupport (Pro/Enterprise)
  - QRCodeSection
- **Fonctionnalités** :
  - Sélection restaurant via query param `?restaurant=id`
  - Banner upgrade pour Free plan
  - Feature gating des onglets

#### `/dashboard/settings`
- **Fichier** : `src/app/dashboard/settings/page.tsx`
- **Description** : Paramètres du restaurant
- **Composants** : SettingsForm
- **Fonctionnalités** :
  - Modification nom, slug, Google Maps URL
  - Sélection restaurant via query param

#### `/dashboard/billing`
- **Fichier** : `src/app/dashboard/billing/page.tsx`
- **Description** : Gestion de l'abonnement
- **Composants** : AdminActions (dev uniquement)
- **Fonctionnalités** :
  - Affichage statut abonnement
  - Lien vers Stripe Customer Portal
  - Lien vers page pricing

---

## 6. Composants

### 6.1 Composants UI (Shadcn/UI)

- `button.tsx` : Boutons personnalisés
- `card.tsx` : Cartes avec header/content
- `dialog.tsx` : Modales
- `input.tsx` : Champs de saisie
- `label.tsx` : Labels de formulaire
- `select.tsx` : Sélecteurs dropdown
- `table.tsx` : Tableaux
- `tabs.tsx` : Onglets
- `textarea.tsx` : Zones de texte
- `sonner.tsx` : Notifications toast

### 6.2 Composants Métier

#### `Navbar`
- **Fichier** : `src/components/navbar.tsx`
- **Description** : Barre de navigation globale
- **Fonctionnalités** :
  - Logo RestoRise
  - Liens : Dashboard, Paramètres, Tarifs, Facturation
  - Bouton déconnexion si connecté
  - Liens login/signup si non connecté

#### `DashboardStats`
- **Fichier** : `src/components/dashboard-stats.tsx`
- **Description** : Cartes de statistiques
- **Métriques** :
  - Total Scans
  - Redirections Positives
  - Négatifs Interceptés

#### `FeedbackList`
- **Fichier** : `src/components/feedback-list.tsx`
- **Description** : Liste des feedbacks négatifs
- **Fonctionnalités** :
  - Affichage rating (sur 5 étoiles)
  - Commentaire et email client
  - Date formatée en français
  - Tri par date (plus récent en premier)

#### `QRCodeSection`
- **Fichier** : `src/components/qrcode-section.tsx`
- **Description** : Génération et téléchargement QR code
- **Fonctionnalités** :
  - Génération QR code SVG
  - Téléchargement PNG
  - Affichage URL du QR code
  - Conseils d'utilisation

#### `ReviewForm`
- **Fichier** : `src/components/review-form.tsx`
- **Description** : Formulaire de notation (page publique)
- **Fonctionnalités** :
  - Notation 5 étoiles (hover remplit toutes les précédentes)
  - Emojis alternatifs (satisfait/insatisfait)
  - Redirection automatique si 4-5 étoiles
  - Formulaire feedback si 1-3 étoiles
  - Support `staffId` pour tracking personnel

#### `StaffManagement`
- **Fichier** : `src/components/staff-management.tsx`
- **Description** : Gestion du personnel
- **Fonctionnalités** :
  - Création membres
  - Liste avec scans totaux
  - Téléchargement QR codes individuels
  - Copie URL QR code
  - Suppression membres

#### `AdvancedAnalytics`
- **Fichier** : `src/components/advanced-analytics.tsx`
- **Description** : Analytics avancés
- **Fonctionnalités** :
  - Sélection période (7j, 30j, 90j, tout)
  - Métriques clés (total, taux satisfaction, taux négatif, scans)
  - Graphiques tendances
  - Performance du personnel
  - Export CSV

#### `PrioritySupport`
- **Fichier** : `src/components/priority-support.tsx`
- **Description** : Formulaire de support prioritaire
- **Fonctionnalités** :
  - Envoi email via Server Action
  - Confirmation d'envoi
  - Restreint aux plans Pro/Enterprise

#### `RestaurantSelector`
- **Fichier** : `src/components/restaurant-selector.tsx`
- **Description** : Sélecteur de restaurant (Enterprise)
- **Fonctionnalités** :
  - Dropdown des restaurants
  - Switch via query param
  - Bouton création nouveau restaurant

#### `CreateRestaurantDialog`
- **Fichier** : `src/components/create-restaurant-dialog.tsx`
- **Description** : Dialog création restaurant
- **Fonctionnalités** :
  - Validation limites (1 pour Free/Pro, 5 pour Enterprise)
  - Génération slug unique
  - Redirection vers dashboard avec restaurant sélectionné

#### `MultiRestaurantManagement`
- **Fichier** : `src/components/multi-restaurant-management.tsx`
- **Description** : Gestion multi-restaurants (Enterprise)
- **Fonctionnalités** :
  - Liste restaurants
  - Création (max 5)
  - Suppression
  - Navigation vers paramètres

#### `PricingCard`
- **Fichier** : `src/components/pricing-card.tsx`
- **Description** : Carte de plan tarifaire
- **Fonctionnalités** :
  - Affichage prix mensuel/annuel
  - Badge "Populaire" (Pro)
  - Badge "Plan actuel"
  - Bouton "S'abonner" / "Plan actuel"
  - Liste fonctionnalités

#### `PricingToggle`
- **Fichier** : `src/components/pricing-toggle.tsx`
- **Description** : Toggle mensuel/annuel
- **Fonctionnalités** :
  - Switch visuel
  - Badge "-20%" pour annuel

---

## 7. Server Actions

### 7.1 Actions Principales

#### `submitFeedback`
- **Fichier** : `src/app/actions.ts`
- **Description** : Soumission d'un feedback négatif
- **Paramètres** :
  - `restaurantId` : ID du restaurant
  - `rating` : Note (1-3)
  - `comment` : Commentaire optionnel
  - `contactEmail` : Email client optionnel
- **Actions** :
  1. Insert dans `feedback`
  2. Log événement "negative_feedback"
  3. Récupération email propriétaire
  4. Envoi email (si plan Pro/Enterprise)
- **Feature Gating** : Email uniquement si `plan !== 'free'`

#### `logEvent`
- **Fichier** : `src/app/actions.ts`
- **Description** : Log d'un événement
- **Paramètres** :
  - `restaurantId` : ID du restaurant
  - `type` : 'scan' | 'positive_redirect' | 'negative_feedback'
- **Action** : Insert dans `events`

#### `updateRestaurantSettings`
- **Fichier** : `src/app/actions.ts`
- **Description** : Mise à jour paramètres restaurant
- **Paramètres** :
  - `restaurantId` : ID du restaurant
  - `name` : Nom
  - `slug` : Slug (unique)
  - `googleMapsUrl` : URL Google Maps
- **Validations** :
  - Vérification propriétaire
  - Vérification unicité slug

#### `createDefaultRestaurant`
- **Fichier** : `src/app/actions.ts`
- **Description** : Création restaurant par défaut
- **Paramètres** :
  - `userId` : ID utilisateur
  - `restaurantName` : Nom optionnel
- **Actions** :
  1. Vérification plan et limites
  2. Génération slug unique
  3. Insert dans `restaurants`
- **Feature Gating** : Limites selon plan (1 pour Free/Pro, 5 pour Enterprise)
- **Client** : Utilise `createAdminClient` pour bypass RLS

#### `submitSupportRequest`
- **Fichier** : `src/app/actions.ts`
- **Description** : Envoi demande support prioritaire
- **Paramètres** :
  - `subject` : Sujet
  - `message` : Message
- **Validations** :
  - Utilisateur connecté
  - Plan Pro ou Enterprise
- **Action** : Envoi email via Resend

### 7.2 Actions d'Authentification

#### `login`
- **Fichier** : `src/app/auth-actions.ts`
- **Description** : Connexion utilisateur
- **Action** : `supabase.auth.signInWithPassword`

#### `logout`
- **Fichier** : `src/app/auth-actions.ts`
- **Description** : Déconnexion utilisateur
- **Action** : `supabase.auth.signOut`

---

## 8. API Routes

### 8.1 Stripe

#### `/api/stripe/checkout`
- **Fichier** : `src/app/api/stripe/checkout/route.ts`
- **Méthode** : POST
- **Description** : Création session Stripe Checkout
- **Paramètres** :
  - `priceId` : ID prix Stripe
  - `planType` : 'pro' | 'enterprise'
  - `isYearly` : boolean
- **Actions** :
  1. Récupération utilisateur
  2. Création session Stripe
  3. Redirection vers Checkout

#### `/api/stripe/webhook`
- **Fichier** : `src/app/api/stripe/webhook/route.ts`
- **Méthode** : POST
- **Description** : Webhook Stripe pour événements
- **Sécurité** : Vérification signature Stripe
- **Événements gérés** :
  - `checkout.session.completed` : Activation abonnement
  - `customer.subscription.updated` : Mise à jour abonnement
  - `customer.subscription.deleted` : Annulation abonnement
  - `invoice.payment_failed` : Échec paiement
  - `invoice.payment_succeeded` : Paiement réussi
- **Actions** :
  - Mise à jour `profiles.subscription_status`
  - Mise à jour `profiles.plan`
  - Mise à jour `profiles.plan_type`

### 8.2 Cron Jobs

#### `/api/cron/reset-scans`
- **Fichier** : `src/app/api/cron/reset-scans/route.ts`
- **Méthode** : POST
- **Description** : Reset mensuel des scans
- **Sécurité** : Vérification `RESET_SCANS_SECRET`
- **Action** : Appel fonction SQL `reset_monthly_scans()` ou update direct
- **Configuration** : Vercel Cron (1er de chaque mois)

### 8.3 Admin (Développement)

#### `/api/admin/update-subscription`
- **Fichier** : `src/app/api/admin/update-subscription/route.ts`
- **Méthode** : POST
- **Description** : Mise à jour manuelle abonnement (dev uniquement)
- **Paramètres** :
  - `userId` : ID utilisateur
  - `status` : Statut abonnement
  - `planType` : Type de plan
- **Environnement** : Uniquement en développement

### 8.4 Auth Callback

#### `/api/auth/callback`
- **Fichier** : `src/app/auth/callback/route.ts`
- **Méthode** : GET
- **Description** : Callback OAuth et confirmation email
- **Actions** :
  1. Échange code pour session
  2. Création restaurant par défaut si nouveau utilisateur
  3. Redirection vers dashboard

---

## 9. Authentification

### 9.1 Méthodes d'Authentification

#### Email/Password
- **Composant** : `LoginForm`, `SignupForm`
- **Actions** : `supabase.auth.signInWithPassword`, `supabase.auth.signUp`
- **Confirmation** : Email de confirmation configuré

#### Google OAuth
- **Composant** : Bouton "Continuer avec Google"
- **Action** : `supabase.auth.signInWithOAuth({ provider: 'google' })`
- **Configuration** : Voir `CONFIGURATION_GOOGLE_OAUTH.md`

### 9.2 Protection des Routes

#### Middleware
- **Fichier** : `middleware.ts`
- **Protection** :
  - Routes `/dashboard/*` : Redirection vers `/login` si non authentifié
  - Routes `/login`, `/signup` : Redirection vers `/dashboard` si authentifié
- **Gestion erreurs** : Continue même si Supabase non configuré (build)

#### Vérification Serveur
- **Pages protégées** : Vérification `supabase.auth.getUser()`
- **Redirection** : `redirect('/login')` si non authentifié

### 9.3 Clients Supabase

#### Client Serveur
- **Fichier** : `src/lib/supabase/server.ts`
- **Usage** : Server Components, Server Actions
- **Cookies** : Gestion automatique via `@supabase/ssr`

#### Client Client
- **Fichier** : `src/lib/supabase/client.ts`
- **Usage** : Client Components
- **Singleton** : Instance unique par composant

#### Client Admin
- **Fichier** : `src/lib/supabase/admin.ts`
- **Usage** : Opérations nécessitant bypass RLS
- **Clé** : `SUPABASE_SERVICE_ROLE_KEY`
- **Sécurité** : Uniquement côté serveur

---

## 10. Paiements (Stripe)

### 10.1 Configuration

#### Variables d'Environnement
- `STRIPE_SECRET_KEY` : Clé secrète Stripe
- `STRIPE_WEBHOOK_SECRET` : Secret webhook
- `STRIPE_PRO_PRICE_ID` : ID prix Pro mensuel
- `STRIPE_PRO_YEARLY_PRICE_ID` : ID prix Pro annuel
- `STRIPE_ENTERPRISE_PRICE_ID` : ID prix Enterprise mensuel
- `STRIPE_ENTERPRISE_YEARLY_PRICE_ID` : ID prix Enterprise annuel

#### Produits Stripe
- **Pro Mensuel** : 29€/mois
- **Pro Annuel** : 279€/an (20% réduction)
- **Enterprise Mensuel** : 99€/mois
- **Enterprise Annuel** : 950€/an (20% réduction)

### 10.2 Flux de Paiement

1. **Sélection Plan** : Utilisateur clique "S'abonner" sur `/pricing`
2. **Checkout** : Redirection vers Stripe Checkout
3. **Paiement** : Utilisateur paie sur Stripe
4. **Webhook** : Stripe envoie événement `checkout.session.completed`
5. **Activation** : Mise à jour `profiles.plan` et `profiles.subscription_status`
6. **Redirection** : Utilisateur redirigé vers `/dashboard/billing?success=true`

### 10.3 Gestion Abonnement

#### Customer Portal
- **Lien** : `https://billing.stripe.com/p/login`
- **Fonctionnalités** :
  - Mise à jour méthode de paiement
  - Annulation abonnement
  - Historique factures

#### Webhooks
- **Événements** : Gestion complète du cycle de vie
- **Mises à jour** : Synchronisation automatique avec DB

---

## 11. Feature Gating

### 11.1 Plans et Limitations

#### Plan Free
- **Restaurants** : 1 maximum
- **Scans** : 30/mois maximum
- **Emails** : Aucun
- **Personnel** : Non
- **Analytics** : Basiques uniquement
- **Support** : Non
- **Branding** : RestoRise visible sur page review

#### Plan Pro
- **Restaurants** : 1 maximum
- **Scans** : Illimités
- **Emails** : Alertes instantanées
- **Personnel** : Oui (QR individuels)
- **Analytics** : Avancés
- **Support** : Prioritaire
- **Branding** : Aucun

#### Plan Enterprise
- **Restaurants** : 5 maximum
- **Scans** : Illimités
- **Emails** : Alertes instantanées
- **Personnel** : Oui (QR individuels)
- **Analytics** : Avancés
- **Support** : Dédié
- **Branding** : Aucun
- **Multi-utilisateurs** : Oui
- **Intégrations** : Personnalisées

### 11.2 Implémentation

#### Vérification Plan
- **Serveur** : Récupération `profile.plan` depuis DB
- **Client** : Props passées aux composants
- **Conditionnel** : Rendu conditionnel selon plan

#### Limitations Scans
- **Logique** : Vérification `scans_this_month > 30` (Free)
- **Action** : Redirection directe vers Google Maps si limite atteinte
- **Reset** : Cron job mensuel (1er du mois)

#### Limitations Restaurants
- **Création** : Vérification nombre restaurants existants
- **Free/Pro** : Maximum 1
- **Enterprise** : Maximum 5
- **Erreur** : Message explicite si limite atteinte

---

## 12. Intégrations

### 12.1 Supabase

#### Services Utilisés
- **PostgreSQL** : Base de données
- **Auth** : Authentification
- **RLS** : Sécurité au niveau ligne
- **Storage** : (Futur : logos restaurants)

#### Configuration
- **URL** : `NEXT_PUBLIC_SUPABASE_URL`
- **Anon Key** : `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Service Role Key** : `SUPABASE_SERVICE_ROLE_KEY`

### 12.2 Stripe

#### Services Utilisés
- **Checkout** : Paiements
- **Subscriptions** : Abonnements récurrents
- **Webhooks** : Événements
- **Customer Portal** : Gestion client

#### Configuration
- Voir `CONFIGURATION_STRIPE.md`

### 12.3 Resend

#### Services Utilisés
- **Email** : Envoi emails transactionnels
- **Templates** : (Futur : templates personnalisés)

#### Configuration
- **API Key** : `RESEND_API_KEY`
- **From** : `RestoRise <noreply@restorise.com>`

### 12.4 Google Maps

#### Intégration
- **URL** : Stockée dans `restaurants.google_maps_url`
- **Redirection** : Directe depuis page review
- **Format** : URL complète Google Maps (partage)

---

## 13. Déploiement

### 13.1 Vercel

#### Configuration
- **Platform** : Vercel
- **Framework** : Next.js
- **Build Command** : `npm run build`
- **Output Directory** : `.next`

#### Variables d'Environnement
- Toutes les variables de `.env.local` doivent être configurées dans Vercel

#### Cron Jobs
- **Fichier** : `vercel-cron-config.json`
- **Job** : Reset scans mensuel (1er du mois à 00:00 UTC)
- **Route** : `/api/cron/reset-scans`

### 13.2 GitHub

#### Repository
- **URL** : `https://github.com/pierre6789/restoboost.git`
- **Branch** : `main`
- **CI/CD** : Automatique via Vercel

### 13.3 Domain

#### Configuration
- **Domaine** : `restorise.fr`
- **DNS** : Pointé vers Vercel
- **SSL** : Automatique via Vercel

---

## 14. Sécurité

### 14.1 Authentification

#### Sessions
- **Gestion** : Supabase Auth
- **Cookies** : HttpOnly, Secure
- **Expiration** : Configurée Supabase

#### OAuth
- **Google** : Configuration sécurisée
- **Redirects** : Validation côté serveur

### 14.2 Base de Données

#### Row Level Security
- **Activation** : Toutes les tables
- **Politiques** : Par utilisateur
- **Bypass** : Uniquement via Service Role (serveur uniquement)

#### Validation
- **Inputs** : Validation côté client et serveur
- **SQL Injection** : Protection via Supabase (paramétré)

### 14.3 API

#### Webhooks
- **Stripe** : Vérification signature
- **Cron** : Vérification secret

#### Rate Limiting
- **Vercel** : Limites par défaut
- **Supabase** : Limites par plan

### 14.4 Paiements

#### Stripe
- **PCI-DSS** : Conformité Stripe
- **Tokens** : Aucun stockage côté client
- **Webhooks** : Signature vérifiée

---

## 15. Maintenance et Monitoring

### 15.1 Logs

#### Vercel
- **Logs** : Accessibles via dashboard Vercel
- **Erreurs** : Notifications configurées

#### Supabase
- **Logs** : Accessibles via dashboard Supabase
- **Queries** : Monitoring des performances

### 15.2 Monitoring

#### Métriques Clés
- **Scans/jour** : Suivi via `events`
- **Conversions** : Free → Pro/Enterprise
- **Churn** : Taux d'annulation
- **Erreurs** : Monitoring Vercel

### 15.3 Backup

#### Base de Données
- **Supabase** : Backups automatiques
- **Fréquence** : Quotidienne
- **Rétention** : 7 jours

---

## 16. Évolutions Futures

### 16.1 Court Terme (Q2 2024)
- Intégration API Google My Business
- Personnalisation QR codes (logo)
- Export CSV analytics
- Notifications push

### 16.2 Moyen Terme (Q3-Q4 2024)
- Intégration TripAdvisor
- Intégration Facebook Reviews
- Campagnes email automatisées
- A/B testing pages review

### 16.3 Long Terme (2025)
- Intelligence artificielle (analyse feedbacks)
- Suggestions automatiques
- Intégrations CRM
- Marketplace d'intégrations

---

**Document créé le** : 2024  
**Version** : 1.0  
**Auteur** : Équipe RestoRise

