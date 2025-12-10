import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirect') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      redirect('/login?error=authentication_failed')
    }

    // If this is a new user (first time signing in), create default restaurant
    if (data.user) {
      const adminSupabase = createAdminClient()
      
      // Check if user already has restaurants
      const { data: restaurants } = await adminSupabase
        .from('restaurants')
        .select('id')
        .eq('user_id', data.user.id)
        .limit(1)

      // If no restaurants, create default restaurant
      if ((!restaurants || restaurants.length === 0) && data.user.id) {
        try {
          // Import the action
          const { createDefaultRestaurant } = await import('@/app/actions')
          await createDefaultRestaurant(data.user.id)
        } catch (error) {
          console.error('Error creating default restaurant:', error)
          // Don't fail the auth flow if restaurant creation fails
        }
      }
    }
  }

  // Redirect to dashboard or the specified redirect URL
  redirect(redirectTo)
}
