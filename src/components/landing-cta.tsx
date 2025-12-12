'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function LandingCTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#FF6B35] via-[#E55A2B] to-[#FF6B35] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <Sparkles className="h-8 w-8 text-white/30" />
          </motion.div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Prêt à booster votre{' '}
            <span className="text-white/90">réputation ?</span>
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-orange-50 max-w-2xl mx-auto leading-relaxed">
            Rejoignez les restaurants qui protègent leur réputation en ligne et augmentent leur visibilité sur Google Maps
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#FF6B35] hover:bg-gray-100 text-lg px-8 py-6 h-auto shadow-2xl hover:shadow-white/50 transition-all group"
            >
              <Link href="/signup" className="flex items-center gap-2">
                Commencer gratuitement
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 h-auto border-2 border-white/30 hover:bg-white/10 backdrop-blur-sm text-white hover:text-white"
            >
              <Link href="/pricing">Voir les tarifs</Link>
            </Button>
          </div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-orange-50"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Essai gratuit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Support 24/7</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

