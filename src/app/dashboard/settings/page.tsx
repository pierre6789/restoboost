import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/settings-form'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ restaurant?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's restaurants
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Type assertion for restaurants
  type Restaurant = { id: string; slug: string; name: string; user_id: string; scans_this_month: number; google_maps_url: string | null; logo_url: string | null; created_at: string; updated_at: string }
  const typedRestaurants = (restaurants || []) as Restaurant[]

  // Get restaurant from query param or use first
  const selectedRestaurantId = params.restaurant
  const restaurant = selectedRestaurantId
    ? typedRestaurants.find(r => r.id === selectedRestaurantId)
    : typedRestaurants.length > 0
    ? typedRestaurants[0]
    : null

  if (!restaurant) {
    redirect('/dashboard')
  }

  // Get user plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const profileData = profile as { plan?: string } | null
  const plan = profileData?.plan || 'free'

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="text-[#2C2C2C]">Paramètres</span>
          </h1>
          <p className="text-lg text-gray-600">
            Gérez les informations de votre restaurant
          </p>
        </div>

        <SettingsForm restaurant={restaurant} plan={plan} />
      </div>
    </>
  )
}

