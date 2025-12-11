'use client'

import { Button } from '@/components/ui/button'

interface PricingToggleProps {
  billingPeriod: 'monthly' | 'yearly'
  onBillingPeriodChange: (period: 'monthly' | 'yearly') => void
}

export function PricingToggle({ billingPeriod, onBillingPeriodChange }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-[#2C2C2C]' : 'text-gray-500'}`}>
        Mensuel
      </span>
      <button
        onClick={() => onBillingPeriodChange(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
          billingPeriod === 'yearly' ? 'bg-[#FF6B35]' : 'bg-gray-300'
        }`}
        aria-label="Toggle billing period"
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
            billingPeriod === 'yearly' ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-[#2C2C2C]' : 'text-gray-500'}`}>
          Annuel
        </span>
        {billingPeriod === 'yearly' && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
            -20%
          </span>
        )}
      </div>
    </div>
  )
}

