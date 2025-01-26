'use client'

import { useBackground } from 'app/context/BackgroundContext'
import { useState, useEffect } from 'react'

export default function Background() {
  const { currentIndex, backgrounds } = useBackground()
  const [isLoading, setIsLoading] = useState(true)
  const [displayIndex, setDisplayIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Preload images with mobile-specific optimizations
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = backgrounds.map(bg => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = resolve
          img.onerror = reject
          
          // Reduce image quality on mobile
          if (isMobile) {
            const url = new URL(bg.url, window.location.origin)
            url.searchParams.set('q', '75') // Reduce quality on mobile
            url.searchParams.set('w', '1200') // Limit width on mobile
            img.src = url.toString()
          } else {
            img.src = bg.url
          }
        })
      })

      try {
        await Promise.all(imagePromises)
      } catch (error) {
        console.error('Failed to preload some images')
      }
    }

    preloadImages()
  }, [isMobile])

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
        key={backgrounds[displayIndex].url}
        src={backgrounds[displayIndex].url}
        alt={backgrounds[displayIndex].alt}
        className={`
          absolute w-full h-full object-cover object-center select-none
          transition-all duration-500 ease-in-out
          ${isMobile ? 'quality-75' : ''} 
        `}
        sizes={isMobile ? "(max-width: 768px) 100vw" : "100vw"}
        style={{
          objectFit: 'cover',
          objectPosition: 'center 40%',
          minHeight: '100%',
          minWidth: '100%',
          transform: isMobile ? 'none' : 'translate3d(0, 0, 0)', // Only use hardware acceleration on desktop
          willChange: isMobile ? 'auto' : 'transform', // Optimize memory usage on mobile
        }}
        draggable="false"
        loading={displayIndex === 0 ? "eager" : "lazy"}
        decoding={isMobile ? "sync" : "async"} // Synchronous decoding on mobile for immediate display
        fetchPriority="high"
      />
      <div className={`
        absolute inset-0 
        ${isMobile ? 'bg-black/10' : 'bg-black/5'} 
        ${isMobile ? 'backdrop-blur-[0.5px]' : 'backdrop-blur-[1px]'}
      `} />
    </div>
  )
} 