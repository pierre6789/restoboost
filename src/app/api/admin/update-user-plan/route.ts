import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, plan, subscriptionStatus } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    if (!['free', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: 'Plan invalide. Doit être: free, pro, ou enterprise' },
        { status: 400 }
      )
    }

    // Use admin client to bypass RLS
    const adminSupabase = createAdminClient()

    // Find user by email
    const { data: profile, error: findError } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (findError || !profile) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    const profileId = (profile as { id: string }).id

    // Prepare update data
    const updateData: any = {
      plan: plan,
      plan_type: plan,
    }

    // Update subscription_status if provided
    if (subscriptionStatus && ['free', 'active', 'canceled', 'past_due'].includes(subscriptionStatus)) {
      updateData.subscription_status = subscriptionStatus
      
      // If setting to free, ensure plan is free
      if (subscriptionStatus === 'free') {
        updateData.plan = 'free'
        updateData.plan_type = 'free'
      }
      // If setting to active, ensure plan matches
      else if (subscriptionStatus === 'active' && plan !== 'free') {
        updateData.plan = plan
        updateData.plan_type = plan
      }
    } else {
      // If no subscription status provided, set based on plan
      if (plan === 'free') {
        updateData.subscription_status = 'free'
      } else {
        updateData.subscription_status = 'active'
      }
    }

    const { error } = await adminSupabase
      .from('profiles')
      .update(updateData as never)
      .eq('id', profileId)

    if (error) {
      console.error('Error updating user plan:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: `Plan de ${email} mis à jour vers ${plan}` 
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

