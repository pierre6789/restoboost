import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PricingCard } from '@/components/pricing-card'
import { Navbar } from '@/components/navbar'
import { PricingPageClient } from '@/components/pricing-page-client'

export default async function PricingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user subscription status and plan
  let subscriptionStatus = 'free'
  let planType = 'free'
  let currentPlan = 'free'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, plan_type, plan')
      .eq('id', user.id)
      .single()

    const profileData = profile as { subscription_status?: string; plan_type?: string; plan?: string } | null
    subscriptionStatus = profileData?.subscription_status || 'free'
    planType = profileData?.plan_type || 'free'
    currentPlan = profileData?.plan || 'free'
  }

  const plans = [
    {
      name: 'Gratuit',
      priceMonthly: '0',
      priceYearly: '0',
      period: 'toujours',
      description: 'Parfait pour tester RestoRise',
      features: [
        '1 restaurant',
        'Max 30 scans/mois',
        'Vérification manuelle du dashboard',
        'Pas d\'alertes email',
        'Pas de suivi du personnel',
        'Branding RestoRise visible',
      ],
      priceIdMonthly: null,
      priceIdYearly: null,
      popular: false,
    },
    {
      name: 'Pro',
      priceMonthly: '29',
      priceYearly: '279', // 29 * 12 * 0.8 = 278.4, arrondi à 279 (20% de réduction)
      period: 'mois',
      description: 'Pour les restaurants qui veulent grandir',
      features: [
        'Scans illimités',
        'Alertes email instantanées',
        'Suivi du personnel (QR individuels)',
        'Pas de branding RestoRise',
        'Analytics avancés',
        'Support prioritaire',
      ],
      priceIdMonthly: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
      priceIdYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
      popular: true,
    },
    {
      name: 'Enterprise',
      priceMonthly: '99',
      priceYearly: '950', // 99 * 12 * 0.8 = 950.4, arrondi à 950 (20% de réduction)
      period: 'mois',
      description: 'Pour les chaînes de restaurants',
      features: [
        'Tout du plan Pro',
        'Jusqu\'à 5 restaurants',
        'Multi-utilisateurs',
        'Intégrations personnalisées',
        'Support dédié',
        'Formation personnalisée',
      ],
      priceIdMonthly: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
      priceIdYearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || 'price_enterprise_yearly',
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-[#2C2C2C]">Choisissez votre</span>{' '}
            <span className="text-[#FF6B35]">plan</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Des tarifs simples et transparents pour tous les besoins
          </p>
        </div>

        <PricingPageClient
          plans={plans}
          subscriptionStatus={subscriptionStatus}
          currentPlan={currentPlan}
          isAuthenticated={!!user}
        />

        {user && (
          <div className="mt-12 text-center">
            <a
              href="/dashboard/billing"
              className="text-[#FF6B35] hover:text-[#E55A2B] font-medium"
            >
              Gérer mon abonnement →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

