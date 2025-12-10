import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Signature manquante' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const planType = (session.metadata?.planType as 'pro' | 'enterprise') || 'pro'

      if (userId && session.subscription) {
        // Update user subscription status, plan type, and plan
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            plan_type: planType,
            plan: planType,
          } as never)
          .eq('id', userId)
      }
      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      
      // Get customer email to find user
      const customer = await stripe.customers.retrieve(subscription.customer as string)
      const customerEmail = typeof customer !== 'deleted' ? customer.email : null

      if (customerEmail) {
        // Find user by email
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .single()

        if (profile) {
          let status: 'active' | 'canceled' | 'past_due' = 'active'
          let plan: 'free' | 'pro' | 'enterprise' = 'free'

          if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            status = 'canceled'
            plan = 'free'
          } else if (subscription.status === 'past_due') {
            status = 'past_due'
            // Keep current plan if past_due
          } else if (subscription.status === 'active') {
            status = 'active'
            // Keep current plan if active
          }

          // Get current plan to preserve it if not canceled
          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', profile.id)
            .single()

          const updateData: { subscription_status: string; plan?: string } = {
            subscription_status: status,
          }

          if (status === 'canceled') {
            updateData.plan = 'free'
          }

          await supabase
            .from('profiles')
            .update(updateData as never)
            .eq('id', profile.id)
        }
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      
      const customer = await stripe.customers.retrieve(customerId)
      const customerEmail = typeof customer !== 'deleted' ? customer.email : null

      if (customerEmail) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .single()

        if (profile) {
          await supabase
            .from('profiles')
            .update({ subscription_status: 'past_due' } as never)
            .eq('id', profile.id)
        }
      }
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      
      const customer = await stripe.customers.retrieve(customerId)
      const customerEmail = typeof customer !== 'deleted' ? customer.email : null

      if (customerEmail) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .single()

        if (profile) {
          await supabase
            .from('profiles')
            .update({ subscription_status: 'active' } as never)
            .eq('id', profile.id)
        }
      }
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

