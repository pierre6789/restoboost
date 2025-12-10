import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardStats } from '@/components/dashboard-stats'
import { FeedbackList } from '@/components/feedback-list'
import { QRCodeSection } from '@/components/qrcode-section'
import { StaffManagement } from '@/components/staff-management'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile to check plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  // Extract plan with type assertion
  const plan = profile 
    ? (profile as { plan: string }).plan 
    : 'free'

  // Get user's restaurant
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!restaurant) {
    // Create default restaurant if none exists
    const { createDefaultRestaurant } = await import('@/app/actions')
    const result = await createDefaultRestaurant(user.id)
    if (result.success) {
      redirect('/dashboard')
    }
  }

  // Extract restaurant properties with type assertion
  const restaurantId = restaurant ? (restaurant as { id: string; slug: string }).id : ''
  const restaurantSlug = restaurant ? (restaurant as { id: string; slug: string }).slug : ''

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="text-[#2C2C2C]">Dashboard</span>
          </h1>
          <p className="text-lg text-gray-600">
            Gérez votre réputation en ligne
          </p>
        </div>

        {restaurant && (
          <>
            {/* Banner for Free Plan */}
            {plan === 'free' && (
              <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-[#FF6B35]/30 rounded-xl shadow-md">
                <p className="text-[#2C2C2C] font-medium">
                  <span className="text-[#FF6B35] font-bold">💡 Upgrade to Pro</span> pour activer les alertes email instantanées et le suivi du personnel.
                </p>
                <a
                  href="/pricing"
                  className="text-[#FF6B35] hover:text-[#E55A2B] font-semibold underline mt-2 inline-block"
                >
                  Voir les plans →
                </a>
              </div>
            )}

            <DashboardStats restaurantId={restaurantId} />

            <Tabs defaultValue="feedback" className="mt-10">
              <TabsList className="bg-gray-100">
                <TabsTrigger 
                  value="feedback"
                  className="data-[state=active]:bg-[#FF6B35] data-[state=active]:text-white"
                >
                  Feedback
                </TabsTrigger>
                {plan !== 'free' && (
                  <TabsTrigger 
                    value="staff"
                    className="data-[state=active]:bg-[#FF6B35] data-[state=active]:text-white"
                  >
                    Personnel
                  </TabsTrigger>
                )}
                <TabsTrigger 
                  value="qrcode"
                  className="data-[state=active]:bg-[#FF6B35] data-[state=active]:text-white"
                >
                  QR Code
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feedback" className="mt-6">
                <FeedbackList restaurantId={restaurant.id} />
              </TabsContent>

              {plan !== 'free' && (
                <TabsContent value="staff" className="mt-6">
                  <StaffManagement restaurantId={restaurant.id} restaurantSlug={restaurant.slug} />
                </TabsContent>
              )}

              <TabsContent value="qrcode" className="mt-6">
                <QRCodeSection
                  restaurant={restaurant}
                  reviewUrl={`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/review/${restaurant.slug}`}
                  plan={plan}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </>
  )
}

