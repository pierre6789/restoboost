import { Resend } from 'resend'

// Lazy initialization to avoid errors during build when env vars are not available
let resendInstance: Resend | null = null

export function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      // Return a mock instance during build - will fail at runtime if actually used
      resendInstance = new Resend('build-time-placeholder')
    } else {
      resendInstance = new Resend(apiKey)
    }
  }
  return resendInstance
}

// Export for backward compatibility, but prefer using getResend()
export const resend = getResend()

