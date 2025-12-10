'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createDefaultRestaurant } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    // Sign up user
    const {
      data: { user },
      error: signUpError,
    } = await supabase.auth.signUp({
      email,
      password,
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

      toast.success('Compte créé avec succès !')
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
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
  )
}

