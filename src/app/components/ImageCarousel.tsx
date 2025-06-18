'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const images = [
  '/screenshots/dashboard.png',
  '/screenshots/client.png',
  '/screenshots/invoice.png',
  // Ajouter d'autres captures
]

export default function ImageCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext()
    }, 2500)

    return () => clearInterval(timer)
  }, [index])

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % images.length)
  }

  const handleSelect = (i: number) => {
    setIndex(i)
  }

  return (
    <div className="w-full flex justify-center py-8">
      <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-lg">
        <div className="relative h-64 sm:h-80 md:h-96 bg-gray-100">
          <AnimatePresence mode="wait">
            <motion.img
              key={images[index]}
              src={images[index]}
              alt={`Capture d'écran ${index + 1}`}
              className="object-cover w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>

          {/* Bouton Précédent */}
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Bouton Suivant */}
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Indicateurs */}
        <div className="absolute bottom-3 w-full flex justify-center space-x-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-3 h-3 rounded-full ${
                i === index ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
