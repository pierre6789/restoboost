'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, TrendingUp, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import type { Database } from '@/lib/supabase/database.types'

type Event = Database['public']['Tables']['events']['Row']

interface AdvancedAnalyticsProps {
  restaurantId: string
}

export function AdvancedAnalytics({ restaurantId }: AdvancedAnalyticsProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const supabase = createClient()

  useEffect(() => {
    loadAnalytics()
  }, [restaurantId, timeRange])

  const loadAnalytics = async () => {
    setIsLoading(true)
    const now = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case 'all':
        startDate.setFullYear(2000) // Very old date
        break
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading analytics:', error)
      toast.error('Erreur lors du chargement des analytics')
    } else {
      setEvents(data || [])
    }
    setIsLoading(false)
  }

  const exportToCSV = () => {
    const csv = [
      ['Date', 'Type', 'Restaurant ID'].join(','),
      ...events.map(event => [
        new Date(event.created_at).toLocaleString('fr-FR'),
        event.type,
        event.restaurant_id,
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `analytics-${restaurantId}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Export CSV téléchargé')
  }

  // Calculate statistics
  const scans = events.filter(e => e.type === 'scan').length
  const positiveRedirects = events.filter(e => e.type === 'positive_redirect').length
  const negativeFeedback = events.filter(e => e.type === 'negative_feedback').length
  const total = events.length

  // Calculate conversion rates
  const positiveRate = total > 0 ? ((positiveRedirects / total) * 100).toFixed(1) : '0'
  const negativeRate = total > 0 ? ((negativeFeedback / total) * 100).toFixed(1) : '0'

  // Group events by date for trend analysis
  const eventsByDate = events.reduce((acc, event) => {
    const date = new Date(event.created_at).toLocaleDateString('fr-FR')
    if (!acc[date]) {
      acc[date] = { scans: 0, positive: 0, negative: 0 }
    }
    if (event.type === 'scan') acc[date].scans++
    if (event.type === 'positive_redirect') acc[date].positive++
    if (event.type === 'negative_feedback') acc[date].negative++
    return acc
  }, {} as Record<string, { scans: number; positive: number; negative: number }>)

  const dates = Object.keys(eventsByDate).sort()

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-[#2C2C2C]">Analytics Avancés</CardTitle>
              <CardDescription className="text-base">
                Analysez les performances de votre restaurant
              </CardDescription>
            </div>
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exporter CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Time Range Selector */}
          <div className="flex gap-2 mb-6">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? 'bg-[#FF6B35] hover:bg-[#E55A2B] text-white' : ''}
              >
                {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : range === '90d' ? '90 jours' : 'Tout'}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-[#2C2C2C]">{total}</div>
                    <p className="text-sm text-gray-600">Total événements</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">{positiveRate}%</div>
                    <p className="text-sm text-gray-600">Taux de satisfaction</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-[#FF6B35]">{negativeRate}%</div>
                    <p className="text-sm text-gray-600">Taux de feedback négatif</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">{scans}</div>
                    <p className="text-sm text-gray-600">Scans totaux</p>
                  </CardContent>
                </Card>
              </div>

              {/* Trend Chart (Simple bar representation) */}
              {dates.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Tendances ({timeRange === '7d' ? '7 jours' : timeRange === '30d' ? '30 jours' : timeRange === '90d' ? '90 jours' : 'Tout'})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dates.slice(-14).map((date) => {
                        const data = eventsByDate[date]
                        const maxValue = Math.max(data.scans, data.positive, data.negative, 1)
                        return (
                          <div key={date} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{date}</span>
                              <span className="text-gray-600">
                                {data.scans} scans, {data.positive} positifs, {data.negative} négatifs
                              </span>
                            </div>
                            <div className="flex gap-1 h-4">
                              <div
                                className="bg-blue-500 rounded"
                                style={{ width: `${(data.scans / maxValue) * 100}%` }}
                              />
                              <div
                                className="bg-green-500 rounded"
                                style={{ width: `${(data.positive / maxValue) * 100}%` }}
                              />
                              <div
                                className="bg-[#FF6B35] rounded"
                                style={{ width: `${(data.negative / maxValue) * 100}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

