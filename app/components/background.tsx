'use client'

import { useBackground } from 'app/context/BackgroundContext'
import { useState, useEffect, useRef } from 'react'

export default function Background() {
  const { currentIndex, backgrounds } = useBackground()
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const preloadedImages = useRef<HTMLImageElement[]>([])
  const firstImageLoaded = useRef(false)

  // Load first image immediately
  useEffect(() => {
    if (!firstImageLoaded.current) {
      const img = new Image()
      img.onload = () => {
        firstImageLoaded.current = true
        setIsLoading(false)
      }
      img.src = backgrounds[0].url
    }
  }, [])

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Preload images based on device
  useEffect(() => {
    const preloadAllImages = async () => {
      try {
        preloadedImages.current = await Promise.all(
          backgrounds.map(bg => {
            return new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image()
              img.onload = () => resolve(img)
              img.onerror = reject

              // Create smaller image URLs for mobile
              if (isMobile) {
                const url = new URL(bg.url, window.location.origin)
                url.searchParams.set('w', '800') // Smaller width for mobile
                url.searchParams.set('q', '80') // Slightly reduced quality
                img.src = url.toString()
              } else {
                img.src = bg.url
              }
            })
          })
        )
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to preload images:', error)
        setIsLoading(false)
      }
    }

    preloadAllImages()
  }, [isMobile, backgrounds])

  if (isLoading) {
    return <div className="fixed inset-0 w-full h-full z-0 bg-[#111]" />
  }

  const currentImage = backgrounds[currentIndex]
  const imageUrl = isMobile 
    ? `${currentImage.url}?w=800&q=80`
    : currentImage.url

  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-[#111] overflow-hidden">
      <img
        key={imageUrl}
        src={imageUrl}
        alt={currentImage.alt}
        className="absolute w-full h-full object-cover object-center select-none"
        style={{
          objectFit: 'cover',
          objectPosition: 'center 40%',
          minHeight: '100%',
          minWidth: '100%',
        }}
        draggable="false"
        loading="eager"
        decoding="sync"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-black/5" />
    </div>
  )
} 