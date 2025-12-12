'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const stats = [
  { value: '100%', label: 'Avis positifs redirigés', icon: '✓' },
  { value: '0', label: 'Avis négatifs publics', icon: '🛡️' },
  { value: '24/7', label: 'Protection active', icon: '⚡' },
  { value: '500+', label: 'Restaurants confiants', icon: '🏆' },
]

function AnimatedNumber({ value, inView }: { value: string; inView: boolean }) {
  // Extract number if possible
  const numValue = value.replace(/[^0-9]/g, '')
  const hasNumber = numValue.length > 0

  if (!hasNumber) {
    return <span>{value}</span>
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8, type: 'spring' }}
    >
      {value}
    </motion.span>
  )
}

export function LandingStats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-white via-orange-50/30 to-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-[#FF6B35]/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-[#FF6B35]/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#2C2C2C] mb-3 md:mb-4 px-2">
            Des résultats qui{' '}
            <span className="text-[#FF6B35]">parlent</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 px-2">
            Rejoignez les restaurants qui font confiance à RestoRise
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#FF6B35]/30">
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 sm:mb-3 md:mb-4">{stat.icon}</div>
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#FF6B35] mb-2 sm:mb-3">
                  <AnimatedNumber value={stat.value} inView={isInView} />
                </div>
                <div className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 font-medium">
                  {stat.label}
                </div>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/5 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

