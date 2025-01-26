'use client'

import { useState } from 'react'

export default function CarouselControls() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)

  const handleClick = (dir: 'left' | 'right') => {
    if (isAnimating) return
    setIsAnimating(true)
    setDirection(dir)
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false)
      setDirection(null)
    }, 300) // Match this with CSS transition duration
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
        <div 
          className={`w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600 transition-all duration-300
            ${isAnimating && direction === 'left' ? 'transform -translate-x-1 opacity-0' : ''}
            ${isAnimating && direction === 'right' ? 'scale-125 opacity-100' : ''}
          `}
        />
        <div 
          className={`w-2 h-2 rounded-full bg-neutral-800 dark:bg-white transition-all duration-300
            ${isAnimating ? 'transform scale-100' : 'scale-125'}
            ${direction === 'left' ? 'translate-x-1' : ''}
            ${direction === 'right' ? '-translate-x-1' : ''}
          `}
        />
        <div 
          className={`w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600 transition-all duration-300
            ${isAnimating && direction === 'right' ? 'transform translate-x-1 opacity-0' : ''}
            ${isAnimating && direction === 'left' ? 'scale-125 opacity-100' : ''}
          `}
        />
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