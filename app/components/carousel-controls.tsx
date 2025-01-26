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
    <div className="flex items-center space-x-4">
      <button
        className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer p-1.5"
        onClick={() => handleClick('left')}
        aria-label="Previous image"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div className="flex items-center space-x-2">
        {backgrounds.map((_, index) => (
          <div 
            key={index}
            className={`w-1 h-1 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-neutral-800 dark:bg-white scale-110' 
                : 'bg-neutral-400 dark:bg-neutral-600'
            }`}
          />
        ))}
      </div>
      <button
        className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer p-1.5"
        onClick={() => handleClick('right')}
        aria-label="Next image"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
} 