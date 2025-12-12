'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import Image from 'next/image'

const testimonials = [
  {
    name: 'Sophie Martin',
    role: 'Propriétaire, Le Bistrot Parisien',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    content: 'RestoRise a transformé notre gestion des avis. Nous avons vu notre note Google Maps passer de 4.2 à 4.7 en seulement 3 mois !',
    rating: 5,
  },
  {
    name: 'Marc Dubois',
    role: 'Directeur, La Brasserie Moderne',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    content: 'L\'interception des avis négatifs nous permet de résoudre les problèmes avant qu\'ils n\'affectent notre réputation. Incontournable !',
    rating: 5,
  },
  {
    name: 'Julie Chen',
    role: 'Gérante, Sushi Zen',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    content: 'Les analytics nous aident à comprendre nos clients. Le suivi du personnel est un plus énorme pour motiver notre équipe.',
    rating: 5,
  },
]

export function LandingTestimonials() {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#2C2C2C] mb-3 md:mb-4 px-2">
            Ce que disent nos{' '}
            <span className="text-[#FF6B35]">clients</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 px-2">
            Des restaurateurs qui font confiance à RestoRise
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group"
            >
              <div className="relative h-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-[#FF6B35]/10">
                  <Quote className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4 sm:mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 sm:h-5 sm:w-5 fill-[#FF6B35] text-[#FF6B35]"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed relative z-10">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-[#FF6B35]/20 flex-shrink-0">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 40px, 48px"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm sm:text-base text-[#2C2C2C] truncate">
                      {testimonial.name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 truncate">
                      {testimonial.role}
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

