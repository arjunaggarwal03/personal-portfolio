'use client'

import { useBackground } from 'app/context/BackgroundContext'
import { useState, useEffect } from 'react'

export default function Background() {
  const { currentIndex, backgrounds } = useBackground()
  const [isLoading, setIsLoading] = useState(true)
  const [displayIndex, setDisplayIndex] = useState(0)

  // Preload all images on mount
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = backgrounds.map(bg => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = resolve
          img.onerror = reject
          img.src = bg.url
        })
      })

      try {
        await Promise.all(imagePromises)
      } catch (error) {
        console.error('Failed to preload some images')
      }
    }

    preloadImages()
  }, [])

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

  if (isLoading) {
    return (
      <div className="fixed inset-0 w-full h-full z-0 bg-[#111]" />
    )
  }

  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-[#111] overflow-hidden">
      <img
        key={backgrounds[displayIndex].url} // Force re-render on image change
        src={backgrounds[displayIndex].url}
        alt={backgrounds[displayIndex].alt}
        className="absolute w-full h-full object-cover object-center select-none transition-all duration-500 ease-in-out"
        style={{
          objectFit: 'cover',
          objectPosition: 'center 40%',
          minHeight: '100%',
          minWidth: '100%',
          transform: 'translate3d(0, 0, 0)', // Hardware acceleration
          willChange: 'transform', // Optimize for animations
        }}
        draggable="false"
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
    </div>
  )
} 