'use client'

import { motion } from 'framer-motion'
import { Play, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

export function LandingDemo() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <section id="demo" className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-[#2C2C2C] via-[#1A1A1A] to-[#2C2C2C] text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6">
              Comment ça{' '}
              <span className="text-[#FF6B35]">marche ?</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 md:mb-8 leading-relaxed">
              En 3 étapes simples, transformez chaque client en ambassadeur de votre restaurant
            </p>

            <div className="space-y-4 md:space-y-6">
              {[
                { step: '1', title: 'Installez vos QR codes', desc: 'Téléchargez et imprimez vos QR codes personnalisés. Placez-les sur vos tables.' },
                { step: '2', title: 'Les clients scannent', desc: 'Vos clients scannent le QR code et laissent un avis directement depuis leur téléphone.' },
                { step: '3', title: 'Nous gérons le reste', desc: 'Les positifs vont sur Google Maps, les négatifs vous sont envoyés par email.' },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="flex gap-3 sm:gap-4 items-start"
                >
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{item.title}</h3>
                    <p className="text-sm sm:text-base text-gray-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Video/Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-1 lg:order-2"
          >
            <div className="relative aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#FF6B35]/20 to-[#E55A2B]/20 border border-[#FF6B35]/30">
              {/* Placeholder for video - replace with actual video */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                {!isPlaying ? (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsPlaying(true)}
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FF6B35] rounded-full flex items-center justify-center shadow-2xl hover:bg-[#E55A2B] transition-colors"
                  >
                    <Play className="h-8 w-8 sm:h-10 sm:w-10 text-white ml-1" />
                  </motion.button>
                ) : (
                  <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80')] bg-cover bg-center"></div>
                )}
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-24 h-24 sm:w-32 sm:h-32 bg-[#FF6B35]/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 sm:w-24 sm:h-24 bg-[#FF6B35]/10 rounded-full blur-xl"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

