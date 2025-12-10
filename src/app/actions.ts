'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitFeedback(
  restaurantId: string,
  rating: number,
  comment: string | null,
  contactEmail: string | null
) {
  const supabase = await createClient()

  // Insert feedback
  const { error: feedbackError } = await supabase
    .from('feedback')
    .insert({
      restaurant_id: restaurantId,
      rating,
      comment: comment || null,
      contact_email: contactEmail || null,
    } as never)

  if (feedbackError) {
    console.error('Error inserting feedback:', feedbackError)
    return { error: 'Erreur lors de l\'enregistrement du feedback' }
  }

  // Log negative_feedback event
  await supabase.from('events').insert({
    restaurant_id: restaurantId,
    type: 'negative_feedback',
  } as never)

  // Get restaurant and owner email
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name, user_id')
    .eq('id', restaurantId)
    .single()

  if (restaurant && 'user_id' in restaurant) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, plan')
      .eq('id', restaurant.user_id as string)
      .single()

    // FEATURE GATING: Only send email if plan is 'pro' or 'enterprise'
    const plan = profile?.plan || 'free'
    if (plan !== 'free' && profile?.email) {
      // Send email notification
      try {
        await resend.emails.send({
          from: 'RestoBoost <noreply@restoboost.com>',
          to: profile.email,
          subject: `Nouveau feedback pour ${restaurant.name}`,
          html: `
            <h2>Nouveau feedback reçu</h2>
            <p><strong>Restaurant:</strong> ${restaurant.name}</p>
            <p><strong>Note:</strong> ${rating}/3</p>
            ${comment ? `<p><strong>Commentaire:</strong> ${comment}</p>` : ''}
            ${contactEmail ? `<p><strong>Email du client:</strong> ${contactEmail}</p>` : ''}
            <p>Connectez-vous à votre dashboard pour voir tous les détails.</p>
          `,
        })
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Don't fail the request if email fails
      }
    }
    // For free plan, feedback is saved but no email is sent
  }

  return { success: true }
}

export async function logEvent(restaurantId: string, type: 'scan' | 'positive_redirect' | 'negative_feedback') {
  const supabase = await createClient()

  const { error } = await supabase.from('events').insert({
    restaurant_id: restaurantId,
    type,
  } as never)

  if (error) {
    console.error('Error logging event:', error)
    return { error: 'Erreur lors de l\'enregistrement de l\'événement' }
  }

  return { success: true }
}

export async function updateRestaurantSettings(
  restaurantId: string,
  name: string,
  slug: string,
  googleMapsUrl: string
) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Verify restaurant belongs to user
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('id', restaurantId)
    .eq('user_id', user.id)
    .single()

  if (!restaurant) {
    return { error: 'Restaurant non trouvé ou accès non autorisé' }
  }

  // Check if slug is already taken by another restaurant
  const { data: existingRestaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('slug', slug)
    .neq('id', restaurantId)
    .single()

  if (existingRestaurant) {
    return { error: 'Ce slug est déjà utilisé par un autre restaurant' }
  }

  // Update restaurant
  const { error } = await supabase
    .from('restaurants')
    .update({
      name,
      slug,
      google_maps_url: googleMapsUrl || null,
    })
    .eq('id', restaurantId)

  if (error) {
    console.error('Error updating restaurant:', error)
    return { error: 'Erreur lors de la mise à jour' }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function createDefaultRestaurant(userId: string) {
  // Use admin client to bypass RLS
  const supabase = createAdminClient()

  // Generate a unique slug
  const baseSlug = 'mon-restaurant'
  let slug = baseSlug
  let counter = 1

  // Check if slug exists and increment if needed
  while (true) {
    const { data: existing } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!existing) {
      break
    }
    slug = `${baseSlug}-${counter}`
    counter++
  }

  const { data, error } = await supabase
    .from('restaurants')
    .insert({
      user_id: userId,
      name: 'Mon Restaurant',
      slug,
      scans_this_month: 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating default restaurant:', error)
    return { error: 'Erreur lors de la création du restaurant' }
  }

  return { success: true, restaurant: data }
}

