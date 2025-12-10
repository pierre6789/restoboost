'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface CreateRestaurantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  plan: string
  currentCount: number
}

export function CreateRestaurantDialog({
  open,
  onOpenChange,
  userId,
  plan,
  currentCount,
}: CreateRestaurantDialogProps) {
  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const maxRestaurants = plan === 'enterprise' ? 5 : 1
  const canCreate = currentCount < maxRestaurants

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Veuillez entrer un nom')
      return
    }

    if (!canCreate) {
      toast.error(`Vous avez atteint la limite de ${maxRestaurants} restaurant${maxRestaurants > 1 ? 's' : ''}`)
      return
    }

    setIsCreating(true)

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    let slug = baseSlug
    let counter = 1

    while (true) {
      const { data: existing } = await supabase
        .from('restaurants')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!existing) break
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const { data, error } = await supabase
      .from('restaurants')
      .insert({
        user_id: userId,
        name: name.trim(),
        slug,
        scans_this_month: 0,
      } as never)
      .select()
      .single()

    if (error) {
      console.error('Error creating restaurant:', error)
      toast.error('Erreur lors de la création')
    } else {
      toast.success('Restaurant créé avec succès')
      setName('')
      onOpenChange(false)
      // Redirect to dashboard with new restaurant selected
      router.push(`/dashboard?restaurant=${data.id}`)
      router.refresh()
    }
    setIsCreating(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau restaurant</DialogTitle>
          <DialogDescription>
            {plan === 'enterprise'
              ? `Vous pouvez créer jusqu'à 5 restaurants (${currentCount}/5)`
              : 'Vous pouvez créer 1 restaurant maximum. Passez au plan Enterprise pour gérer jusqu\'à 5 restaurants.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="restaurant-name">Nom du restaurant</Label>
              <Input
                id="restaurant-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mon Restaurant"
                disabled={isCreating || !canCreate}
                className="mt-1"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !canCreate}
              className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
            >
              {isCreating ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

