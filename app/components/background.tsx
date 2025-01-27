'use client'

import { useBackground } from 'app/context/BackgroundContext'
import { useState, useEffect, useRef } from 'react'

export default function Background() {
  const { currentIndex, backgrounds } = useBackground()
  const [isLoading, setIsLoading] = useState(true)
  const [displayIndex, setDisplayIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map())

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Preload and cache images
  useEffect(() => {
    const preloadImage = async (url: string) => {
      if (imageCache.current.has(url)) return

      const img = new Image()
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          imageCache.current.set(url, img)
          resolve(img)
        }
        img.onerror = reject
        
        if (isMobile) {
          const optimizedUrl = new URL(url, window.location.origin)
          optimizedUrl.searchParams.set('q', '75')
          optimizedUrl.searchParams.set('w', '1200')
          img.src = optimizedUrl.toString()
        } else {
          img.src = url
        }
      })
    }

    // Preload current, next, and previous images
    const preloadImages = async () => {
      const currentImg = backgrounds[currentIndex].url
      const nextImg = backgrounds[(currentIndex + 1) % backgrounds.length].url
      const prevImg = backgrounds[(currentIndex - 1 + backgrounds.length) % backgrounds.length].url

      try {
        await Promise.all([
          preloadImage(currentImg),
          preloadImage(nextImg),
          preloadImage(prevImg)
        ])
      } catch (error) {
        console.error('Failed to preload images:', error)
      }
    }

    preloadImages()
  }, [currentIndex, isMobile])

  // Handle image transitions
  useEffect(() => {
    if (!isLoading) {
      setIsTransitioning(true)
      const timer = setTimeout(() => {
        setDisplayIndex(currentIndex)
        setIsTransitioning(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, isLoading])

  if (isLoading) {
    return <div className="fixed inset-0 w-full h-full z-0 bg-[#111]" />
  }

  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-[#111] overflow-hidden">
      <img
        key={backgrounds[displayIndex].url}
        src={backgrounds[displayIndex].url}
        alt={backgrounds[displayIndex].alt}
        className={`
          absolute w-full h-full object-cover object-center select-none
          transition-all duration-300 ease-in-out
          ${isTransitioning ? 'opacity-0' : 'opacity-100'}
          ${isMobile ? 'quality-75' : ''}
        `}
        sizes={isMobile ? "(max-width: 768px) 100vw" : "100vw"}
        style={{
          objectFit: 'cover',
          objectPosition: 'center 40%',
          minHeight: '100%',
          minWidth: '100%',
          transform: isMobile ? 'none' : 'translate3d(0, 0, 0)',
          willChange: isMobile ? 'auto' : 'transform',
        }}
        draggable="false"
        loading="eager"
        decoding={isMobile ? "sync" : "async"}
        fetchPriority="high"
      />
      <div 
        className={`
          absolute inset-0 
          ${isMobile ? 'bg-black/10' : 'bg-black/5'}
          ${isMobile ? 'backdrop-blur-[0.5px]' : 'backdrop-blur-[1px]'}
          transition-opacity duration-300
          ${isTransitioning ? 'opacity-100' : 'opacity-90'}
        `} 
      />
    </div>
  )
} 