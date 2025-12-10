import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Logo } from '@/components/logo'
import { ArrowRight, QrCode, TrendingUp, Shield, Zap, BarChart3, Smartphone } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="flex justify-center animate-fade-in">
              <Logo href={undefined} width={320} height={128} />
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-[#2C2C2C]">Boostez votre</span>{' '}
              <span className="text-[#FF6B35]">réputation</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              La solution intelligente pour gérer les avis de vos clients.
              <br />
              <span className="text-[#FF6B35] font-semibold">Redirigez les positifs, interceptez les négatifs.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/signup" className="flex items-center gap-2">
                  Commencer gratuitement
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 h-auto border-2 border-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-white transition-all"
              >
                <Link href="/login">Se connecter</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des outils puissants pour transformer chaque interaction client en opportunité
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:border-[#FF6B35]/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35]/5 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <QrCode className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#2C2C2C] mb-3">QR Codes Dynamiques</h3>
                <p className="text-gray-600 leading-relaxed">
                  Générez des QR codes uniques pour chaque table. Vos clients scannent et laissent un avis en quelques secondes.
                </p>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:border-[#FF6B35]/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35]/5 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#2C2C2C] mb-3">Redirection Intelligente</h3>
                <p className="text-gray-600 leading-relaxed">
                  Les avis positifs (4-5 étoiles) sont automatiquement redirigés vers Google Maps pour maximiser votre visibilité.
                </p>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:border-[#FF6B35]/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35]/5 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#2C2C2C] mb-3">Protection de Réputation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Les avis négatifs sont interceptés et envoyés par email. Traitez-les en privé avant qu'ils n'affectent votre réputation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-[#2C2C2C] to-[#1A1A1A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-[#FF6B35] mb-2">100%</div>
              <div className="text-gray-300">Avis positifs redirigés</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#FF6B35] mb-2">0</div>
              <div className="text-gray-300">Avis négatifs publics</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#FF6B35] mb-2">24/7</div>
              <div className="text-gray-300">Protection active</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">En 3 étapes simples</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">Installez vos QR codes</h3>
              <p className="text-gray-600">
                Téléchargez et imprimez vos QR codes personnalisés. Placez-les sur vos tables.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">Les clients scannent</h3>
              <p className="text-gray-600">
                Vos clients scannent le QR code et laissent un avis directement depuis leur téléphone.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">Nous gérons le reste</h3>
              <p className="text-gray-600">
                Les positifs vont sur Google Maps, les négatifs vous sont envoyés par email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à booster votre réputation ?
          </h2>
          <p className="text-xl mb-8 text-orange-50">
            Rejoignez les restaurants qui protègent leur réputation en ligne
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-white text-[#FF6B35] hover:bg-gray-100 text-lg px-8 py-6 h-auto shadow-xl"
          >
            <Link href="/signup" className="flex items-center gap-2">
              Commencer gratuitement
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
