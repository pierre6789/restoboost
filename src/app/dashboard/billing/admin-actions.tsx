'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export function AdminActions() {
  const [isLoading, setIsLoading] = useState(false)

  const updateSubscription = async (
    status: 'free' | 'active' | 'canceled' | 'past_due',
    planType?: 'free' | 'pro' | 'enterprise'
  ) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, planType }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success(`Statut mis à jour : ${status}`)
        window.location.reload()
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm">Outils Admin (Développement)</CardTitle>
        <CardDescription className="text-xs">
          Pour tester les différents statuts d'abonnement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateSubscription('free')}
            disabled={isLoading}
          >
            Gratuit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateSubscription('active', 'pro')}
            disabled={isLoading}
          >
            Actif (Pro)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateSubscription('active', 'enterprise')}
            disabled={isLoading}
          >
            Actif (Enterprise)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateSubscription('canceled')}
            disabled={isLoading}
          >
            Annulé
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateSubscription('past_due')}
            disabled={isLoading}
          >
            Paiement en attente
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

