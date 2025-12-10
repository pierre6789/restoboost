'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Database } from '@/lib/supabase/database.types'

type Restaurant = Database['public']['Tables']['restaurants']['Row']

interface RestaurantSelectorProps {
  restaurants: Restaurant[]
  currentRestaurantId: string
  plan: string
  userId: string
}

export function RestaurantSelector({
  restaurants,
  currentRestaurantId,
  plan,
  userId,
}: RestaurantSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isChanging, setIsChanging] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const currentRestaurant = restaurants.find(r => r.id === currentRestaurantId)

  const handleSelectRestaurant = async (restaurantId: string) => {
    if (restaurantId === currentRestaurantId) return

    setIsChanging(true)
    const params = new URLSearchParams(searchParams.toString())
    params.set('restaurant', restaurantId)
    router.push(`/dashboard?${params.toString()}`)
    router.refresh()
    setIsChanging(false)
  }

  const canCreateMore = plan === 'enterprise' 
    ? restaurants.length < 5 
    : restaurants.length < 1

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Restaurant :</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="min-w-[200px] justify-between"
              disabled={isChanging}
            >
              {currentRestaurant ? currentRestaurant.name : 'Sélectionner...'}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[200px]">
            {restaurants.map((restaurant) => (
              <DropdownMenuItem
                key={restaurant.id}
                onClick={() => handleSelectRestaurant(restaurant.id)}
                className={restaurant.id === currentRestaurantId ? 'bg-[#FF6B35]/10' : ''}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{restaurant.name}</span>
                  <span className="text-xs text-gray-500">{restaurant.slug}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {canCreateMore && (
        <>
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="sm"
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            {plan === 'enterprise' ? 'Nouveau restaurant' : 'Créer restaurant'}
          </Button>
          <CreateRestaurantDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            userId={userId}
            plan={plan}
            currentCount={restaurants.length}
          />
        </>
      )}

      {plan === 'enterprise' && restaurants.length >= 5 && (
        <span className="text-sm text-gray-500">
          Limite de 5 restaurants atteinte
        </span>
      )}
    </div>
  )
}

