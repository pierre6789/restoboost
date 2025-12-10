import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PricingCard } from '@/components/pricing-card'
import { Navbar } from '@/components/navbar'

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
      price: '0',
      period: 'toujours',
      description: 'Parfait pour tester RestoBoost',
      features: [
        '1 restaurant',
        'Max 30 scans/mois',
        'Vérification manuelle du dashboard',
        'Pas d\'alertes email',
        'Pas de suivi du personnel',
        'Branding RestoBoost visible',
      ],
      priceId: null,
      popular: false,
    },
    {
      name: 'Pro',
      price: '29',
      period: 'mois',
      description: 'Pour les restaurants qui veulent grandir',
      features: [
        'Scans illimités',
        'Alertes email instantanées',
        'Suivi du personnel (QR individuels)',
        'Pas de branding RestoBoost',
        'Analytics avancés',
        'Support prioritaire',
      ],
      priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '99',
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
      priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
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

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              currentStatus={subscriptionStatus}
              currentPlanType={currentPlan}
              isAuthenticated={!!user}
            />
          ))}
        </div>

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

