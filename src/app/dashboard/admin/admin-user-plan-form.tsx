'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export function AdminUserPlanForm() {
  const [email, setEmail] = useState('')
  const [plan, setPlan] = useState<'free' | 'pro' | 'enterprise'>('free')
  const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'active' | 'canceled' | 'past_due'>('free')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Veuillez entrer un email')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/update-user-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          plan,
          subscriptionStatus,
        }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success(data.message || `Plan mis à jour avec succès`)
        setEmail('')
        setPlan('free')
        setSubscriptionStatus('free')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-update subscription status based on plan
  const handlePlanChange = (newPlan: 'free' | 'pro' | 'enterprise') => {
    setPlan(newPlan)
    if (newPlan === 'free') {
      setSubscriptionStatus('free')
    } else {
      setSubscriptionStatus('active')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email de l'utilisateur</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="utilisateur@example.com"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="plan">Plan</Label>
        <Select
          value={plan}
          onValueChange={(value) => handlePlanChange(value as 'free' | 'pro' | 'enterprise')}
          disabled={isLoading}
        >
          <SelectTrigger id="plan">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Gratuit</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subscriptionStatus">Statut d'abonnement</Label>
        <Select
          value={subscriptionStatus}
          onValueChange={(value) => setSubscriptionStatus(value as 'free' | 'active' | 'canceled' | 'past_due')}
          disabled={isLoading || plan === 'free'}
        >
          <SelectTrigger id="subscriptionStatus">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Gratuit</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="canceled">Annulé</SelectItem>
            <SelectItem value="past_due">Paiement en attente</SelectItem>
          </SelectContent>
        </Select>
        {plan === 'free' && (
          <p className="text-xs text-muted-foreground">
            Le statut est automatiquement défini sur "Gratuit" pour le plan gratuit
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
        disabled={isLoading}
      >
        {isLoading ? 'Mise à jour...' : 'Mettre à jour le plan'}
      </Button>
    </form>
  )
}

