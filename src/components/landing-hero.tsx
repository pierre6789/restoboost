'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play } from 'lucide-react'
import { Logo } from '@/components/logo'

export function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/20 via-[#2C2C2C]/10 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent z-20"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-[#FF6B35]/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF6B35]/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <Logo width={280} height={112} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6"
        >
          <span className="text-[#2C2C2C]">Boostez votre</span>{' '}
          <motion.span
            className="text-[#FF6B35] inline-block"
            animate={{
              backgroundPosition: ['0%', '100%', '0%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundImage: 'linear-gradient(90deg, #FF6B35, #E55A2B, #FF6B35)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            réputation
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl lg:text-3xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-12"
        >
          La solution intelligente pour{' '}
          <span className="font-semibold text-[#FF6B35]">gérer les avis</span> de vos clients.
          <br />
          <span className="text-lg md:text-xl text-gray-600">
            Redirigez les positifs, interceptez les négatifs.
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            asChild
            size="lg"
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white text-lg px-8 py-6 h-auto shadow-2xl hover:shadow-[#FF6B35]/50 transition-all group"
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
            className="text-lg px-8 py-6 h-auto border-2 border-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-white transition-all backdrop-blur-sm bg-white/80"
          >
            <Link href="#demo" className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Voir la démo
            </Link>
          </Button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>100% des avis positifs redirigés</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>0 avis négatifs publics</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Protection 24/7</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-[#FF6B35] rounded-full flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

