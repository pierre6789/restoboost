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
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-4">
            Ce que disent nos{' '}
            <span className="text-[#FF6B35]">clients</span>
          </h2>
          <p className="text-xl text-gray-600">
            Des restaurateurs qui font confiance à RestoRise
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group"
            >
              <div className="relative h-full bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 text-[#FF6B35]/10">
                  <Quote className="h-12 w-12" />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-[#FF6B35] text-[#FF6B35]"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-6 leading-relaxed relative z-10">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#FF6B35]/20">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-[#2C2C2C]">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
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

