import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Scan, TrendingUp, Shield } from 'lucide-react'

interface DashboardStatsProps {
  restaurantId: string
}

export async function DashboardStats({ restaurantId }: DashboardStatsProps) {
  const supabase = await createClient()

  // Get stats
  const [scansResult, positiveRedirectsResult, negativeFeedbackResult] =
    await Promise.all([
      supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .eq('type', 'scan'),
      supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .eq('type', 'positive_redirect'),
      supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .eq('type', 'negative_feedback'),
    ])

  const totalScans = scansResult.count || 0
  const positiveRedirects = positiveRedirectsResult.count || 0
  const interceptedNegatives = negativeFeedbackResult.count || 0

  const stats = [
    {
      title: 'Total Scans',
      value: totalScans.toLocaleString(),
      description: 'QR codes scannés',
      icon: Scan,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Redirections Positives',
      value: positiveRedirects.toLocaleString(),
      description: 'Vers Google Maps (4-5 étoiles)',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Négatifs Interceptés',
      value: interceptedNegatives.toLocaleString(),
      description: 'Feedback sauvegardé',
      icon: Shield,
      color: 'text-[#FF6B35]',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card 
            key={stat.title}
            className="border border-gray-200 hover:border-[#FF6B35]/30 hover:shadow-lg transition-all duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold text-[#2C2C2C]">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#2C2C2C] mb-2">{stat.value}</div>
              <p className="text-sm text-gray-600">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

