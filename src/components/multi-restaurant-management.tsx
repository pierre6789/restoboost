'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2, Settings, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Database } from '@/lib/supabase/database.types'

type Restaurant = Database['public']['Tables']['restaurants']['Row']

interface MultiRestaurantManagementProps {
  userId: string
  currentRestaurantId: string
}

export function MultiRestaurantManagement({ userId, currentRestaurantId }: MultiRestaurantManagementProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newRestaurantName, setNewRestaurantName] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadRestaurants()
  }, [userId])

  const loadRestaurants = async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading restaurants:', error)
      toast.error('Erreur lors du chargement des restaurants')
    } else {
      setRestaurants(data || [])
    }
    setIsLoading(false)
  }

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newRestaurantName.trim()) {
      toast.error('Veuillez entrer un nom')
      return
    }

    // Check restaurant limit (max 5 for Enterprise)
    if (restaurants.length >= 5) {
      toast.error('Vous avez atteint la limite de 5 restaurants')
      return
    }

    setIsCreating(true)

    // Generate unique slug
    const baseSlug = newRestaurantName
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
        name: newRestaurantName.trim(),
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
      setNewRestaurantName('')
      loadRestaurants()
    }
    setIsCreating(false)
  }

  const handleDeleteRestaurant = async (restaurantId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce restaurant ? Cette action est irréversible.')) {
      return
    }

    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', restaurantId)

    if (error) {
      console.error('Error deleting restaurant:', error)
      toast.error('Erreur lors de la suppression')
    } else {
      toast.success('Restaurant supprimé')
      loadRestaurants()
      // If deleted restaurant was current, redirect to first restaurant or dashboard
      if (restaurantId === currentRestaurantId) {
        router.push('/dashboard')
      }
    }
  }

  const handleSwitchRestaurant = (restaurantId: string) => {
    router.push(`/dashboard?restaurant=${restaurantId}`)
    router.refresh()
  }

  if (isLoading) {
    return <div>Chargement...</div>
  }

  return (
    <Card className="border border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#2C2C2C]">Gestion Multi-Restaurants</CardTitle>
        <CardDescription className="text-base">
          Gérez jusqu'à 5 restaurants ({restaurants.length}/5)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateRestaurant} className="flex gap-2 mb-6">
          <div className="flex-1">
            <Label htmlFor="restaurant-name" className="sr-only">Nom du restaurant</Label>
            <Input
              id="restaurant-name"
              value={newRestaurantName}
              onChange={(e) => setNewRestaurantName(e.target.value)}
              placeholder="Nom du restaurant"
              disabled={isCreating || restaurants.length >= 5}
            />
          </div>
          <Button
            type="submit"
            disabled={isCreating || restaurants.length >= 5}
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </form>

        {restaurants.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            Aucun restaurant. Créez-en un pour commencer.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Scans ce mois</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurants.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell className="font-medium">{restaurant.name}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {restaurant.slug}
                    </code>
                  </TableCell>
                  <TableCell>{restaurant.scans_this_month || 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {restaurant.id !== currentRestaurantId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSwitchRestaurant(restaurant.id)}
                          className="gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Activer
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/settings?restaurant=${restaurant.id}`)}
                        className="gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Paramètres
                      </Button>
                      {restaurants.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRestaurant(restaurant.id)}
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

