'use client'

import { useState } from 'react'
import { updateRestaurantSettings, uploadRestaurantLogo } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SettingsFormProps {
  restaurant: {
    id: string
    name: string
    slug: string
    google_maps_url: string | null
    logo_url: string | null
  }
  plan: string
}

export function SettingsForm({ restaurant, plan }: SettingsFormProps) {
  const router = useRouter()
  const [name, setName] = useState(restaurant.name)
  const [slug, setSlug] = useState(restaurant.slug)
  const [googleMapsUrl, setGoogleMapsUrl] = useState(
    restaurant.google_maps_url || ''
  )
  const [logoUrl, setLogoUrl] = useState(restaurant.logo_url)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const isEnterprise = plan === 'enterprise'

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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Le fichier doit être une image')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier ne doit pas dépasser 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleLogoUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const file = formData.get('logo') as File

    if (!file) {
      toast.error('Veuillez sélectionner un fichier')
      return
    }

    setIsUploadingLogo(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('logo', file)

      const result = await uploadRestaurantLogo(restaurant.id, uploadFormData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Logo uploadé avec succès')
        if (result.logoUrl) {
          setLogoUrl(result.logoUrl)
          setLogoPreview(null)
        }
        // Reset file input
        const fileInput = document.getElementById('logo-upload') as HTMLInputElement
        if (fileInput) {
          fileInput.value = ''
        }
        // Refresh the page data to get the updated logo
        router.refresh()
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
      console.error(error)
    } finally {
      setIsUploadingLogo(false)
    }
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
          {/* Logo Upload - Enterprise Only */}
          {isEnterprise && (
            <div className="space-y-2">
              <Label>Logo du Restaurant</Label>
              <div className="flex items-start gap-4">
                {logoUrl && (
                  <div className="relative">
                    <Image
                      src={logoUrl}
                      alt="Logo actuel"
                      width={80}
                      height={80}
                      className="rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <form onSubmit={handleLogoUpload} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        disabled={isUploadingLogo}
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        disabled={isUploadingLogo || !logoPreview}
                        size="sm"
                        className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
                      >
                        {isUploadingLogo ? (
                          'Upload...'
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Uploader
                          </>
                        )}
                      </Button>
                    </div>
                    {logoPreview && (
                      <div className="relative inline-block mt-2">
                        <Image
                          src={logoPreview}
                          alt="Aperçu"
                          width={60}
                          height={60}
                          className="rounded-full object-cover border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview(null)
                            const fileInput = document.getElementById('logo-upload') as HTMLInputElement
                            if (fileInput) {
                              fileInput.value = ''
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Formats acceptés : JPG, PNG, GIF (max 5MB). Le logo s'affichera sur votre page de review.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          )}

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

