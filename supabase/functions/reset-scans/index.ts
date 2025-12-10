// Supabase Edge Function pour réinitialiser les scans mensuellement
// À appeler via un cron job externe (GitHub Actions, Vercel Cron, etc.)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Vérifier la clé secrète pour sécuriser l'endpoint
    const authHeader = req.headers.get('Authorization')
    const expectedSecret = Deno.env.get('RESET_SCANS_SECRET')
    
    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Créer le client Supabase avec la clé de service
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Réinitialiser tous les scans
    const { error } = await supabase
      .from('restaurants')
      .update({ scans_this_month: 0 })
      .gt('scans_this_month', 0)

    if (error) {
      console.error('Error resetting scans:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Compter combien de restaurants ont été mis à jour
    const { count } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .gt('scans_this_month', 0)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Scans réinitialisés avec succès`,
        restaurants_updated: count || 0
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

