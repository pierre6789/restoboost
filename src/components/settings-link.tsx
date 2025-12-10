'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

export function SettingsLink() {
  const searchParams = useSearchParams()
  const restaurantId = searchParams.get('restaurant')
  
  const href = restaurantId 
    ? `/dashboard/settings?restaurant=${restaurantId}`
    : '/dashboard/settings'

  return (
    <Link href={href} className="relative">
      <Button variant="ghost" size="sm" className="gap-2">
        <Settings className="h-4 w-4" />
        Paramètres
      </Button>
    </Link>
  )
}

