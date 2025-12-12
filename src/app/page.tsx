import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { LandingHero } from '@/components/landing-hero'
import { LandingFeatures } from '@/components/landing-features'
import { LandingDemo } from '@/components/landing-demo'
import { LandingStats } from '@/components/landing-stats'
import { LandingTestimonials } from '@/components/landing-testimonials'
import { LandingCTA } from '@/components/landing-cta'

export default async function HomePage() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect('/dashboard')
    }
  } catch (error) {
    // If Supabase is not configured, continue to show the landing page
    console.error('Error initializing Supabase:', error)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <LandingHero />
      <LandingFeatures />
      <LandingDemo />
      <LandingStats />
      <LandingTestimonials />
      <LandingCTA />
    </div>
  )
}
