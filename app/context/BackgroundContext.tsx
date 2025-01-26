'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface BackgroundImage {
  url: string
  alt: string
}

interface BackgroundContextType {
  currentIndex: number
  backgrounds: BackgroundImage[]
  nextBackground: () => void
  previousBackground: () => void
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined)

const allBackgrounds = [
  {
    url: '/water-lillies.jpg',
    alt: 'Abstract sunset with floating figures'
  },
  {
    url: '/van-gogh.jpg',
    alt: 'Abstract sunset with floating figures'
  },
  {
    url: '/okeefe-lake-george.jpg',
    alt: 'Abstract sunset with floating figures'
  },
  {
    url: '/warhol-crash.jpg',
    alt: 'Abstract sunset with floating figures'
  }
]

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [backgrounds] = useState(allBackgrounds)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)

  // Preload remaining images after initial render
  useEffect(() => {
    const preloadImages = async () => {
      // Skip the first image as it's already loaded
      const imagesToPreload = backgrounds.slice(1)
      imagesToPreload.forEach(bg => {
        const img = new Image()
        img.src = bg.url
      })
    }
    
    preloadImages()
  }, [])

  // Handle hydration and localStorage
  useEffect(() => {
    setIsHydrated(true)
    const saved = localStorage.getItem('backgroundIndex')
    if (saved !== null) {
      const parsedIndex = parseInt(saved)
      if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < backgrounds.length) {
        setCurrentIndex(parsedIndex)
      }
    }
  }, [])

  // Update localStorage when currentIndex changes, but only after hydration
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('backgroundIndex', currentIndex.toString())
    }
  }, [currentIndex, isHydrated])

  const nextBackground = () => {
    setCurrentIndex((prev) => (prev + 1) % backgrounds.length)
  }

  const previousBackground = () => {
    setCurrentIndex((prev) => (prev - 1 + backgrounds.length) % backgrounds.length)
  }

  return (
    <BackgroundContext.Provider value={{ currentIndex, backgrounds, nextBackground, previousBackground }}>
      {children}
    </BackgroundContext.Provider>
  )
}

export function useBackground() {
  const context = useContext(BackgroundContext)
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider')
  }
  return context
} 