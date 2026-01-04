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

  if (restaurant) {
    // Extract user_id with type assertion
    const userId = (restaurant as { user_id: string; name: string }).user_id
    const restaurantName = (restaurant as { user_id: string; name: string }).name
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, plan')
      .eq('id', userId)
      .single()

    // FEATURE GATING: Only send email if plan is 'pro' or 'enterprise'
    // Extract properties with type assertion
    const profileEmail = profile ? (profile as { email: string; plan: string }).email : null
    const plan = profile ? (profile as { email: string; plan: string }).plan : 'free'
    
    if (plan !== 'free' && profileEmail) {
      // Send email notification
      try {
        await resend.emails.send({
          from: 'RestoRise <noreply@restorise.com>',
          to: profileEmail,
          subject: `Nouveau feedback pour ${restaurantName}`,
          html: `
            <h2>Nouveau feedback reçu</h2>
            <p><strong>Restaurant:</strong> ${restaurantName}</p>
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
    } as never)
    .eq('id', restaurantId)

  if (error) {
    console.error('Error updating restaurant:', error)
    return { error: 'Erreur lors de la mise à jour' }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function uploadRestaurantLogo(
  restaurantId: string,
  formData: FormData
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
    .select('id, user_id')
    .eq('id', restaurantId)
    .single()

  if (!restaurant) {
    return { error: 'Restaurant non trouvé ou accès non autorisé' }
  }

  const restaurantData = restaurant as { id: string; user_id: string }
  if (restaurantData.user_id !== user.id) {
    return { error: 'Accès non autorisé' }
  }

  // Check user plan (only Enterprise can upload logos)
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const profileData = profile as { plan?: string } | null
  const plan = profileData?.plan || 'free'

  if (plan !== 'enterprise') {
    return { error: 'L\'upload de logo est réservé aux plans Enterprise' }
  }

  const file = formData.get('logo') as File
  if (!file) {
    return { error: 'Aucun fichier fourni' }
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { error: 'Le fichier doit être une image' }
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Le fichier ne doit pas dépasser 5MB' }
  }

  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${restaurantId}-${Date.now()}.${fileExt}`
    const filePath = `restaurant-logos/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('restaurant-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading logo:', uploadError)
      return { error: 'Erreur lors de l\'upload du logo' }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('restaurant-assets').getPublicUrl(filePath)

    // Delete old logo if exists
    const { data: currentRestaurant } = await supabase
      .from('restaurants')
      .select('logo_url')
      .eq('id', restaurantId)
      .single()

    if (currentRestaurant) {
      const currentLogoUrl = (currentRestaurant as { logo_url: string | null }).logo_url
      if (currentLogoUrl && currentLogoUrl.includes('restaurant-assets')) {
        // Extract file path from URL
        const urlParts = currentLogoUrl.split('restaurant-assets/')
        if (urlParts.length > 1) {
          const oldFilePath = urlParts[1].split('?')[0]
          if (oldFilePath) {
            await supabase.storage.from('restaurant-assets').remove([oldFilePath])
          }
        }
      }
    }

    // Get restaurant slug for revalidation
    const { data: restaurantData } = await supabase
      .from('restaurants')
      .select('slug')
      .eq('id', restaurantId)
      .single()

    // Update restaurant with new logo URL
    const { error: updateError } = await supabase
      .from('restaurants')
      .update({ logo_url: publicUrl } as never)
      .eq('id', restaurantId)

    if (updateError) {
      console.error('Error updating restaurant logo:', updateError)
      return { error: 'Erreur lors de la mise à jour du logo' }
    }

    revalidatePath('/dashboard/settings')
    if (restaurantData) {
      const slug = (restaurantData as { slug: string }).slug
      revalidatePath(`/review/${slug}`)
    }
    // Also revalidate all review pages
    revalidatePath('/review', 'layout')
    return { success: true, logoUrl: publicUrl }
  } catch (error) {
    console.error('Error uploading logo:', error)
    return { error: 'Une erreur est survenue lors de l\'upload' }
  }
}

export async function createDefaultRestaurant(userId: string, restaurantName?: string) {
  // Use admin client to bypass RLS
  const supabase = createAdminClient()

  // Check user plan to enforce restaurant limits
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single()

  const plan = profile ? (profile as { plan: string }).plan : 'free'

  // Check existing restaurants count
  const { data: existingRestaurants } = await supabase
    .from('restaurants')
    .select('id')
    .eq('user_id', userId)

  const restaurantCount = existingRestaurants?.length || 0

  // Enforce limits: Free/Pro = 1 restaurant, Enterprise = 5 restaurants
  if (plan !== 'enterprise' && restaurantCount >= 1) {
    return { error: 'Vous avez atteint la limite de 1 restaurant. Passez au plan Enterprise pour gérer jusqu\'à 5 restaurants.' }
  }

  if (plan === 'enterprise' && restaurantCount >= 5) {
    return { error: 'Vous avez atteint la limite de 5 restaurants.' }
  }

  // Generate a unique slug
  const name = restaurantName || 'Mon Restaurant'
  const baseSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  
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
      name,
      slug,
      scans_this_month: 0,
    } as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating restaurant:', error)
    return { error: 'Erreur lors de la création du restaurant' }
  }

  return { success: true, restaurant: data }
}

export async function submitSupportRequest(subject: string, message: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vous devez être connecté' }
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, plan')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { error: 'Profil non trouvé' }
  }

  const profileData = profile as { email: string; plan: string }
  const userEmail = profileData.email || user.email || 'unknown@example.com'
  const plan = profileData.plan || 'free'

  // Only allow Pro and Enterprise plans
  if (plan === 'free') {
    return { error: 'Le support prioritaire est réservé aux plans Pro et Enterprise' }
  }

  try {
    // Send email via Resend
    await resend.emails.send({
      from: 'RestoRise Support <support@restorise.com>',
      to: 'support@restorise.com', // Your support email
      replyTo: userEmail,
      subject: `[Support Prioritaire - ${plan.toUpperCase()}] ${subject}`,
      html: `
        <h2>Nouvelle demande de support prioritaire</h2>
        <p><strong>De:</strong> ${userEmail}</p>
        <p><strong>Plan:</strong> ${plan}</p>
        <p><strong>Sujet:</strong> ${subject}</p>
        <hr>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending support request:', error)
    return { error: 'Erreur lors de l\'envoi de votre demande' }
  }
}

