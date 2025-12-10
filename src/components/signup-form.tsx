'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createDefaultRestaurant } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Chrome } from 'lucide-react'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    // Get redirect URL for email confirmation
    const baseUrl = process.env.NEXT_PUBLIC_URL || window.location.origin
    const redirectTo = `${baseUrl}/auth/callback`

    // Sign up user
    const {
      data: { user },
      error: signUpError,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    })

    if (signUpError) {
      toast.error(signUpError.message || 'Erreur lors de l\'inscription')
      setIsLoading(false)
      return
    }

    if (user) {
      // Create default restaurant
      const result = await createDefaultRestaurant(user.id)

      if (result.error) {
        toast.error(result.error)
        setIsLoading(false)
        return
      }

      toast.success('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.')
      // Don't redirect immediately - user needs to confirm email
    }
  }

  const handleGoogleSignup = async () => {
    const supabase = createClient()
    const baseUrl = process.env.NEXT_PUBLIC_URL || window.location.origin
    const redirectTo = `${baseUrl}/auth/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })

    if (error) {
      toast.error(error.message || 'Erreur lors de la connexion avec Google')
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Minimum 6 caractères
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
        disabled={isLoading}
      >
        {isLoading ? 'Création...' : 'Créer un compte'}
      </Button>
    </form>

    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-white px-2 text-muted-foreground">Ou</span>
      </div>
    </div>

    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleSignup}
      disabled={isLoading}
    >
      <Chrome className="h-4 w-4 mr-2" />
      Continuer avec Google
    </Button>
    </div>
  )
}

