'use client'

import { useState } from 'react'
import { PricingCard } from '@/components/pricing-card'
import { PricingToggle } from '@/components/pricing-toggle'

interface Plan {
  name: string
  priceMonthly: string
  priceYearly: string
  period: string
  description: string
  features: string[]
  priceIdMonthly: string | null
  priceIdYearly: string | null
  popular: boolean
}

interface PricingPageClientProps {
  plans: Plan[]
  subscriptionStatus: string
  currentPlan: string
  isAuthenticated: boolean
}

export function PricingPageClient({
  plans,
  subscriptionStatus,
  currentPlan,
  isAuthenticated,
}: PricingPageClientProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <>
      <PricingToggle billingPeriod={billingPeriod} onBillingPeriodChange={setBillingPeriod} />
      
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <PricingCard
            key={plan.name}
            plan={{
              name: plan.name,
              price: billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly,
              period: billingPeriod === 'monthly' ? plan.period : 'an',
              description: plan.description,
              features: plan.features,
              priceId: billingPeriod === 'monthly' ? plan.priceIdMonthly : plan.priceIdYearly,
              popular: plan.popular,
            }}
            currentStatus={subscriptionStatus}
            currentPlanType={currentPlan}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </>
  )
}

