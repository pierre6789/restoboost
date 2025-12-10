import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logEvent } from '@/app/actions'
import { ReviewForm } from '@/components/review-form'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ staff_id?: string }>
}) {
  const { slug } = await params
  const { staff_id } = await searchParams
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  // Fetch restaurant by slug with user info
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('id, name, slug, google_maps_url, logo_url, scans_this_month, user_id')
    .eq('slug', slug)
    .single()

  if (error || !restaurant) {
    notFound()
  }

  // Get user plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', restaurant.user_id)
    .single()

  const plan = profile?.plan || 'free'

  // Increment scans_this_month (using admin client to bypass RLS)
  const newScansCount = (restaurant.scans_this_month || 0) + 1
  await adminSupabase
    .from('restaurants')
    .update({ scans_this_month: newScansCount } as never)
    .eq('id', restaurant.id)

  // FEATURE GATING: If free plan and over limit, redirect directly to Google Maps
  if (plan === 'free' && newScansCount > 30) {
    if (restaurant.google_maps_url) {
      redirect(restaurant.google_maps_url)
    }
    // If no Google Maps URL, still show the form but log the event
  }

  // Log scan event
  await logEvent(restaurant.id, 'scan')

  // If staff_id is provided, increment their total_scans (only for pro/enterprise)
  if (staff_id && plan !== 'free') {
    const { data: staff } = await adminSupabase
      .from('staff_members')
      .select('total_scans')
      .eq('id', staff_id)
      .eq('restaurant_id', restaurant.id)
      .single()

    if (staff) {
      await adminSupabase
        .from('staff_members')
        .update({ total_scans: (staff.total_scans || 0) + 1 } as never)
        .eq('id', staff_id)
    }
  }

  // Determine if branding should be shown (free plan only)
  const showBranding = plan === 'free'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-10 space-y-8 border border-gray-100">
          {/* Logo/Name Section */}
          <div className="text-center space-y-4">
            {restaurant.logo_url ? (
              <div className="flex justify-center">
                <Image
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {restaurant.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {restaurant.name}
            </h1>
          </div>

          {/* Review Form */}
          <ReviewForm
            restaurantId={restaurant.id}
            googleMapsUrl={restaurant.google_maps_url}
            staffId={staff_id}
          />
        </div>

        {/* Footer - Only show for free plan */}
        {showBranding && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Propulsé par <span className="font-semibold">RestoBoost</span>
          </p>
        )}
      </div>
    </div>
  )
}

