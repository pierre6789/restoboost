'use client'

import { useState } from 'react'
import { submitFeedback, logEvent } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Star, Smile, Frown } from 'lucide-react'

interface ReviewFormProps {
  restaurantId: string
  googleMapsUrl: string | null
  staffId?: string
}

export function ReviewForm({ restaurantId, googleMapsUrl, staffId }: ReviewFormProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

  const handleRatingClick = async (selectedRating: number) => {
    setRating(selectedRating)

    // If rating is 4 or 5, redirect immediately
    if (selectedRating >= 4) {
      // Log positive redirect event
      await logEvent(restaurantId, 'positive_redirect')

      // Redirect to Google Maps
      if (googleMapsUrl) {
        window.location.href = googleMapsUrl
      } else {
        toast.error('Lien Google Maps non configuré')
      }
      return
    }

    // If rating is 1, 2, or 3, show feedback form
    if (selectedRating <= 3) {
      setShowFeedbackForm(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!rating || rating > 3) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitFeedback(
        restaurantId,
        rating,
        comment || null,
        contactEmail || null
      )

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Merci pour votre feedback !')
        // Reset form
        setComment('')
        setContactEmail('')
        setShowFeedbackForm(false)
        setRating(null)
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#2C2C2C] mb-3">
          Comment s'est passée votre expérience ?
        </h2>
        <p className="text-gray-600">
          Votre avis nous aide à nous améliorer
        </p>
      </div>

      {!showFeedbackForm ? (
        // Rating Selection
        <div className="space-y-4">
          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                className={`transition-all transform hover:scale-110 ${
                  rating === star
                    ? 'text-yellow-400 scale-110'
                    : 'text-gray-300 hover:text-yellow-300'
                }`}
                aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
              >
                <Star
                  size={48}
                  className={rating === star ? 'fill-current' : ''}
                />
              </button>
            ))}
          </div>

          {/* Emoji Alternative */}
          <div className="flex justify-center gap-6 pt-2">
            <button
              type="button"
              onClick={() => handleRatingClick(5)}
              className="transition-all transform hover:scale-110 active:scale-95"
              aria-label="Satisfait"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Smile size={32} className="text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Satisfait
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleRatingClick(1)}
              className="transition-all transform hover:scale-110 active:scale-95"
              aria-label="Insatisfait"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <Frown size={32} className="text-red-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Insatisfait
                </span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        // Feedback Form
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="comment">Votre commentaire (optionnel)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Dites-nous ce qui peut être amélioré..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">
              Votre email (optionnel - pour vous recontacter)
            </Label>
            <Input
              id="email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="votre@email.com"
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowFeedbackForm(false)
                setRating(null)
              }}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

