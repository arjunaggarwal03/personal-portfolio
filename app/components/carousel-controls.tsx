'use client'

import { useState } from 'react'
import { useBackground } from 'app/context/BackgroundContext'

export default function CarouselControls() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const { previousBackground, nextBackground, currentIndex, backgrounds } = useBackground()

  const handleClick = (dir: 'left' | 'right') => {
    if (isAnimating) return
    setIsAnimating(true)
    setDirection(dir)
    
    if (dir === 'left') {
      previousBackground()
    } else {
      nextBackground()
    }

    setTimeout(() => {
      setIsAnimating(false)
      setDirection(null)
    }, 300)
  }

  return (
    <div className="flex items-center space-x-6">
      <button
        className="text-xl font-light transition-all hover:text-neutral-800 dark:hover:text-neutral-200"
        onClick={() => handleClick('left')}
        aria-label="Previous image"
      >
        ←
      </button>
      <div className="flex items-center space-x-3 px-2">
        {backgrounds.map((_, index) => (
          <div 
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-neutral-800 dark:bg-white scale-125' 
                : 'bg-neutral-400 dark:bg-neutral-600'
            }`}
          />
        ))}
      </div>
      <button
        className="text-xl font-light transition-all hover:text-neutral-800 dark:hover:text-neutral-200"
        onClick={() => handleClick('right')}
        aria-label="Next image"
      >
        →
      </button>
    </div>
  )
} 