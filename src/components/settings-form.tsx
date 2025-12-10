'use client'

import { useState } from 'react'
import { updateRestaurantSettings } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface SettingsFormProps {
  restaurant: {
    id: string
    name: string
    slug: string
    google_maps_url: string | null
  }
}

export function SettingsForm({ restaurant }: SettingsFormProps) {
  const [name, setName] = useState(restaurant.name)
  const [slug, setSlug] = useState(restaurant.slug)
  const [googleMapsUrl, setGoogleMapsUrl] = useState(
    restaurant.google_maps_url || ''
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await updateRestaurantSettings(
        restaurant.id,
        name,
        slug,
        googleMapsUrl
      )

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Paramètres mis à jour avec succès')
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate slug from name
  const handleNameChange = (value: string) => {
    setName(value)
    // Auto-generate slug if it hasn't been manually edited
    if (slug === restaurant.slug || slug === generateSlug(restaurant.name)) {
      setSlug(generateSlug(value))
    }
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  return (
    <Card className="border border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#2C2C2C]">Informations du Restaurant</CardTitle>
        <CardDescription className="text-base">
          Modifiez les informations de votre restaurant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du Restaurant</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Mon Restaurant"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {process.env.NEXT_PUBLIC_URL || 'https://restorise.fr'}/
                review/
              </span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="mon-restaurant"
                required
                pattern="[a-z0-9-]+"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Utilisé dans l'URL de votre page de review. Doit être unique et
              contenir uniquement des lettres minuscules, chiffres et tirets.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="googleMapsUrl">
              URL Google Maps (pour les avis positifs)
            </Label>
            <Input
              id="googleMapsUrl"
              type="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
            />
            <p className="text-xs text-muted-foreground">
              Les clients satisfaits (4-5 étoiles) seront redirigés vers cette
              URL. Exemple:{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                https://maps.app.goo.gl/...
              </code>
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

