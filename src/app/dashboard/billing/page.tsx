import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { AdminActions } from './admin-actions'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, plan_type')
    .eq('id', user.id)
    .single()

  const subscriptionStatus = profile?.subscription_status || 'free'
  const planType = profile?.plan_type || 'free'

  const params = await searchParams
  const showSuccess = params.success === 'true'
  const showCanceled = params.canceled === 'true'

  const getStatusBadge = () => {
    switch (subscriptionStatus) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Actif
          </span>
        )
      case 'canceled':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
            <XCircle className="h-4 w-4" />
            Annulé
          </span>
        )
      case 'past_due':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-sm font-medium">
            <AlertCircle className="h-4 w-4" />
            Paiement en attente
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            Gratuit
          </span>
        )
    }
  }

  const getPlanName = () => {
    if (subscriptionStatus === 'active') {
      switch (planType) {
        case 'pro':
          return 'Plan Pro'
        case 'enterprise':
          return 'Plan Enterprise'
        default:
          return 'Plan Pro'
      }
    }
    return 'Plan Gratuit'
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="text-[#2C2C2C]">Facturation</span>
          </h1>
          <p className="text-lg text-gray-600">
            Gérez votre abonnement et vos paiements
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl shadow-md">
            <p className="text-green-800 font-medium">
              ✅ Paiement réussi ! Votre abonnement est maintenant actif.
            </p>
          </div>
        )}

        {showCanceled && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300 rounded-xl shadow-md">
            <p className="text-yellow-800 font-medium">
              Le paiement a été annulé. Aucun changement n'a été effectué.
            </p>
          </div>
        )}

        <div className="grid gap-6">
          {/* Admin tools - only show in development */}
          {process.env.NODE_ENV === 'development' && <AdminActions />}

          <Card className="border border-gray-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-[#2C2C2C]">Plan actuel</CardTitle>
                  <CardDescription className="mt-1 text-base">
                    {getPlanName()}
                  </CardDescription>
                </div>
                {getStatusBadge()}
              </div>
            </CardHeader>
            <CardContent>
              {subscriptionStatus === 'free' && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Vous utilisez actuellement le plan gratuit. Passez à un plan
                    payant pour débloquer plus de fonctionnalités.
                  </p>
                  <Button asChild className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white">
                    <Link href="/pricing">Voir les plans</Link>
                  </Button>
                </div>
              )}

              {subscriptionStatus === 'active' && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Votre abonnement est actif. Vous avez accès à toutes les
                    fonctionnalités premium.
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline" asChild>
                      <Link href="/pricing">Changer de plan</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <a
                        href="https://billing.stripe.com/p/login"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Gérer dans Stripe
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {subscriptionStatus === 'past_due' && (
                <div className="space-y-4">
                  <p className="text-[#FF6B35]">
                    Votre dernier paiement a échoué. Veuillez mettre à jour
                    votre méthode de paiement pour continuer à utiliser le
                    service.
                  </p>
                  <Button variant="outline" asChild>
                    <a
                      href="https://billing.stripe.com/p/login"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Mettre à jour le paiement
                    </a>
                  </Button>
                </div>
              )}

              {subscriptionStatus === 'canceled' && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Votre abonnement a été annulé. Vous pouvez vous réabonner à
                    tout moment.
                  </p>
                  <Button asChild className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white">
                    <Link href="/pricing">Réabonner</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#2C2C2C]">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-base text-gray-600">
              <p className="flex items-start gap-2">
                <span className="text-[#FF6B35] font-bold">•</span>
                <span>Les paiements sont sécurisés et gérés par Stripe</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#FF6B35] font-bold">•</span>
                <span>Vous pouvez annuler votre abonnement à tout moment</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#FF6B35] font-bold">•</span>
                <span>Aucun frais caché, facturation mensuelle simple</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

