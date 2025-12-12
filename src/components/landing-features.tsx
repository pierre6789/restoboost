'use client'

import { motion } from 'framer-motion'
import { QrCode, TrendingUp, Shield, Zap, BarChart3, Smartphone, Mail, Users } from 'lucide-react'
import Image from 'next/image'

const features = [
  {
    icon: QrCode,
    title: 'QR Codes Dynamiques',
    description: 'Générez des QR codes uniques pour chaque table. Vos clients scannent et laissent un avis en quelques secondes.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: TrendingUp,
    title: 'Redirection Intelligente',
    description: 'Les avis positifs (4-5 étoiles) sont automatiquement redirigés vers Google Maps pour maximiser votre visibilité.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'Protection de Réputation',
    description: 'Les avis négatifs sont interceptés et envoyés par email. Traitez-les en privé avant qu\'ils n\'affectent votre réputation.',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics Avancés',
    description: 'Suivez vos performances en temps réel avec des analytics détaillés et des rapports personnalisés.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Suivi du Personnel',
    description: 'Créez des QR codes individuels pour chaque membre de votre équipe et suivez leurs performances.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Mail,
    title: 'Alertes Instantanées',
    description: 'Recevez des notifications email immédiates dès qu\'un feedback négatif est reçu pour réagir rapidement.',
    image: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=800&q=80',
    color: 'from-yellow-500 to-orange-500',
  },
]

export function LandingFeatures() {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#2C2C2C] mb-4 md:mb-6 px-2">
            Tout ce dont vous avez{' '}
            <span className="text-[#FF6B35]">besoin</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto px-2">
            Des outils puissants pour transformer chaque interaction client en opportunité de croissance
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="relative h-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
                  {/* Image */}
                  <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6 md:p-8">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg`}
                    >
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#2C2C2C] mb-2 sm:mb-3 md:mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Hover Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`}></div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

