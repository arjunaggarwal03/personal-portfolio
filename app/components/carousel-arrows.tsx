'use client'

import { useState } from 'react'
import { useBackground } from 'app/context/BackgroundContext'

export default function CarouselArrows() {
  const [isAnimating, setIsAnimating] = useState(false)
  const { previousBackground, nextBackground } = useBackground()

  const handleClick = (dir: 'left' | 'right') => {
    if (isAnimating) return
    setIsAnimating(true)
    
    if (dir === 'left') {
      previousBackground()
    } else {
      nextBackground()
    }

    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }

  return (
    <>
      {/* Left Arrow */}
      <button
        className="fixed left-6 top-1/2 -translate-y-1/2 z-20 rounded-xl bg-white/95 dark:bg-stone-900/90 backdrop-blur-sm border border-white/20 dark:border-white/10 p-3 shadow-xl transition-all hover:scale-110 hover:bg-white dark:hover:bg-stone-800 cursor-pointer"
        onClick={() => handleClick('left')}
        aria-label="Previous artwork"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="w-5 h-5 text-neutral-700 dark:text-neutral-300"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Right Arrow */}
      <button
        className="fixed right-6 top-1/2 -translate-y-1/2 z-20 rounded-xl bg-white/95 dark:bg-stone-900/90 backdrop-blur-sm border border-white/20 dark:border-white/10 p-3 shadow-xl transition-all hover:scale-110 hover:bg-white dark:hover:bg-stone-800 cursor-pointer"
        onClick={() => handleClick('right')}
        aria-label="Next artwork"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="w-5 h-5 text-neutral-700 dark:text-neutral-300"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </>
  )
}

