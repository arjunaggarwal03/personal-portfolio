'use client'

import { useBackground } from 'app/context/BackgroundContext'
import { useState, useEffect } from 'react'

export default function Background() {
  const { currentIndex, backgrounds } = useBackground()
  const [isLoading, setIsLoading] = useState(true)
  const [displayIndex, setDisplayIndex] = useState(0)

  useEffect(() => {
    // Get the initial index from localStorage on mount
    const saved = localStorage.getItem('backgroundIndex')
    if (saved !== null) {
      const parsedIndex = parseInt(saved)
      if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < backgrounds.length) {
        setDisplayIndex(parsedIndex)
      }
    }
    setIsLoading(false)
  }, [])

  // Update displayIndex when currentIndex changes
  useEffect(() => {
    if (!isLoading) {
      setDisplayIndex(currentIndex)
    }
  }, [currentIndex, isLoading])

  // Don't render anything until we have loaded the initial state
  if (isLoading) {
    return (
      <div className="fixed inset-0 w-full h-full z-0 bg-[#111]" />
    )
  }

  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-[#111] overflow-hidden">
      <img
        src={backgrounds[displayIndex].url}
        alt={backgrounds[displayIndex].alt}
        className="absolute w-full h-full object-cover object-center select-none transition-opacity duration-500"
        style={{
          objectFit: 'cover',
          objectPosition: 'center 40%', // Adjust this value to control vertical positioning
          minHeight: '100%',
          minWidth: '100%',
        }}
        draggable="false"
      />
      {/* Subtle overlay for better visibility of content */}
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
    </div>
  )
} 