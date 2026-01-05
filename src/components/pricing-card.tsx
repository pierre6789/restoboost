'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, CheckCircle2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface PricingCardProps {
  plan: {
    name: string
    price: string
    period: string
    description: string
    features: string[]
    priceId: string | null
    popular: boolean
  }
  currentStatus: string
  currentPlanType: string
  isAuthenticated: boolean
}

export function PricingCard({
  plan,
  currentStatus,
  currentPlanType,
  isAuthenticated,
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      router.push('/signup?redirect=/pricing')
      return
    }

    if (!plan.priceId) {
      // Free plan - already active
      toast.info('Vous utilisez déjà le plan gratuit')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: plan.priceId }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error('Erreur lors de la création de la session de paiement')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const isCurrentPlan =
    (plan.name === 'Gratuit' && (currentPlanType === 'free' || currentStatus === 'free')) ||
    (plan.name === 'Pro' &&
      currentStatus === 'active' &&
      currentPlanType === 'pro') ||
    (plan.name === 'Enterprise' &&
      currentStatus === 'active' &&
      currentPlanType === 'enterprise')

  return (
    <Card
      className={`relative transition-all duration-300 ${
        plan.popular
          ? 'border-2 border-[#FF6B35] shadow-2xl scale-105 bg-gradient-to-br from-white to-orange-50/30'
          : 'border border-gray-200 hover:border-[#FF6B35]/50 hover:shadow-xl'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <span className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
            Populaire
          </span>
        </div>
      )}

      <CardHeader className="pb-4">
        <CardTitle className="text-3xl font-bold text-[#2C2C2C]">{plan.name}</CardTitle>
        <CardDescription className="text-base mt-2">{plan.description}</CardDescription>
        <div className="mt-6">
          <span className="text-5xl font-bold text-[#2C2C2C]">{plan.price}€</span>
          <span className="text-gray-600 ml-2 text-lg">/{plan.period}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => {
            const isNegative = feature.toLowerCase().startsWith('pas de') || feature.toLowerCase().startsWith('pas d\'')
            return (
              <li key={index} className="flex items-start">
                {isNegative ? (
                  <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                ) : (
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-gray-700">{feature}</span>
              </li>
            )
          })}
        </ul>

        {isCurrentPlan ? (
          <Button
            disabled
            className="w-full bg-green-500 hover:bg-green-600 cursor-not-allowed"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Plan actuel
          </Button>
        ) : (
          <Button
            onClick={handleSubscribe}
            disabled={isLoading}
            className={`w-full ${
              plan.popular
                ? 'bg-[#FF6B35] hover:bg-[#E55A2B]'
                : 'bg-[#2C2C2C] hover:bg-[#1A1A1A]'
            }`}
          >
            {isLoading
              ? 'Chargement...'
              : plan.priceId
                ? 'S\'abonner'
                : 'Commencer gratuitement'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

