// API Route pour réinitialiser les scans mensuellement
// À utiliser avec Vercel Cron ou un service similaire

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Vérifier la clé secrète pour sécuriser l'endpoint
  const authHeader = request.headers.get('authorization')
  const expectedSecret = process.env.RESET_SCANS_SECRET

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const supabase = createAdminClient()

    // Compter les restaurants à réinitialiser avant
    const { count: countBefore } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .gt('scans_this_month', 0)

    // Appeler la fonction SQL pour réinitialiser
    const { error } = await supabase.rpc('reset_monthly_scans')

    if (error) {
      console.error('Error resetting scans:', error)
      // Fallback: si la fonction n'existe pas, utiliser l'update direct
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ scans_this_month: 0 })
        .gt('scans_this_month', 0)

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Scans réinitialisés avec succès',
      restaurants_updated: countBefore || 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

