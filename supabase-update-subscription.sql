-- Script pour mettre à jour manuellement le statut d'abonnement d'un utilisateur
-- Remplacez 'votre-email@example.com' par votre email

-- Mettre en plan "active" (Pro/Enterprise)
UPDATE profiles
SET subscription_status = 'active'
WHERE email = 'votre-email@example.com';

-- Ou mettre en plan "free" (Gratuit)
-- UPDATE profiles
-- SET subscription_status = 'free'
-- WHERE email = 'votre-email@example.com';

-- Ou mettre en "canceled" (Annulé)
-- UPDATE profiles
-- SET subscription_status = 'canceled'
-- WHERE email = 'votre-email@example.com';

-- Ou mettre en "past_due" (Paiement en attente)
-- UPDATE profiles
-- SET subscription_status = 'past_due'
-- WHERE email = 'votre-email@example.com';

