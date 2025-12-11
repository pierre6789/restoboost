import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { status, planType } = await request.json()

    if (!['free', 'active', 'canceled', 'past_due'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      )
    }

    // Use admin client to bypass RLS
    const adminSupabase = createAdminClient()

    const updateData: any = { subscription_status: status }
    
    // Update plan_type and plan if provided, or set based on status
    if (planType && ['free', 'pro', 'enterprise'].includes(planType)) {
      updateData.plan_type = planType
      updateData.plan = planType
    } else if (status === 'active' && !planType) {
      // Default to 'pro' if status is active but no plan type specified
      updateData.plan_type = 'pro'
      updateData.plan = 'pro'
    } else if (status === 'free') {
      updateData.plan_type = 'free'
      updateData.plan = 'free'
    }

    const { error } = await adminSupabase
      .from('profiles')
      .update(updateData as never)
      .eq('id', user.id)

    if (error) {
      console.error('Error updating subscription:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

