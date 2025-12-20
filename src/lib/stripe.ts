import Stripe from 'stripe'

// Lazy initialization to avoid errors during build when env vars are not available
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      // Return a mock instance during build - will fail at runtime if actually used
      stripeInstance = new Stripe('sk_test_build_time_placeholder', {
        apiVersion: '2025-12-15.clover',
        typescript: true,
      })
    } else {
      stripeInstance = new Stripe(secretKey, {
        apiVersion: '2025-12-15.clover',
        typescript: true,
      })
    }
  }
  return stripeInstance
}

// Export for backward compatibility, but prefer using getStripe()
export const stripe = getStripe()

