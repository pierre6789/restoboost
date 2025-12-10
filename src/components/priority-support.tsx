'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageCircle, Send, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { resend } from '@/lib/resend'

export function PrioritySupport() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject.trim() || !message.trim()) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    setIsSubmitting(true)

    try {
      // Get user info
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Vous devez être connecté')
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single()

      const userEmail = profile ? (profile as { email: string }).email : user.email || 'unknown@example.com'

      // Send email via Resend
      await resend.emails.send({
        from: 'RestoBoost Support <support@restoboost.com>',
        to: 'support@restoboost.com', // Your support email
        replyTo: userEmail,
        subject: `[Support Prioritaire] ${subject}`,
        html: `
          <h2>Nouvelle demande de support prioritaire</h2>
          <p><strong>De:</strong> ${userEmail}</p>
          <p><strong>Sujet:</strong> ${subject}</p>
          <hr>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      })

      toast.success('Votre demande a été envoyée. Nous vous répondrons dans les plus brefs délais.')
      setSubject('')
      setMessage('')
      setIsSubmitted(true)
      setTimeout(() => setIsSubmitted(false), 5000)
    } catch (error) {
      console.error('Error sending support request:', error)
      toast.error('Erreur lors de l\'envoi de votre demande')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border border-gray-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#FF6B35]/10 rounded-xl">
            <MessageCircle className="h-6 w-6 text-[#FF6B35]" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-[#2C2C2C]">Support Prioritaire</CardTitle>
            <CardDescription className="text-base">
              Contactez notre équipe pour une assistance rapide
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isSubmitted ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-[#2C2C2C]">Demande envoyée avec succès !</p>
            <p className="text-gray-600 mt-2">Nous vous répondrons dans les plus brefs délais.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="subject">Sujet</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Décrivez brièvement votre problème"
                required
                disabled={isSubmitting}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Décrivez votre problème en détail..."
                rows={6}
                required
                disabled={isSubmitting}
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
            >
              {isSubmitting ? (
                'Envoi en cours...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer la demande
                </>
              )}
            </Button>

            <p className="text-sm text-gray-500 text-center">
              Temps de réponse garanti : &lt; 24h pour les utilisateurs Pro
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

