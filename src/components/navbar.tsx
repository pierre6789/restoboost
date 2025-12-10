import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { logout } from '@/app/auth-actions'
import { Logo } from '@/components/logo'
import { SettingsLink } from '@/components/settings-link'
import { Suspense } from 'react'

export async function Navbar() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 py-2">
          <Logo href={user ? '/dashboard' : '/'} width={120} height={48} />
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="ghost" size="sm">
                    Tarifs
                  </Button>
                </Link>
                <Link href="/dashboard/billing">
                  <Button variant="ghost" size="sm">
                    Facturation
                  </Button>
                </Link>
                <Link href={restaurantId ? `/dashboard/settings?restaurant=${restaurantId}` : '/dashboard/settings'} className="relative">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Paramètres
                  </Button>
                </Link>
                <form action={logout}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/pricing">
                  <Button variant="ghost" size="sm">
                    Tarifs
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white">
                    Inscription
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

