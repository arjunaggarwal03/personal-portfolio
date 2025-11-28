'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface BackgroundImage {
  url: string
  alt: string
  title: string
  artist: string
  year: string
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
    url: '/rembrandt-bridge.jpg',
    alt: 'Rembrandt bridge painting',
    title: 'The Stone Bridge',
    artist: 'Rembrandt van Rijn',
    year: '1638'
  },
  {
    url: '/water-lillies.jpg',
    alt: 'Water lilies painting',
    title: 'Water Lilies',
    artist: 'Claude Monet',
    year: '1919'
  },
  {
    url: '/van-gogh.jpg',
    alt: 'Van Gogh painting',
    title: 'Starry Night',
    artist: 'Vincent van Gogh',
    year: '1889'
  },
  {
    url: '/okeefe-lake-george.jpg',
    alt: 'Georgia O\'Keeffe landscape',
    title: 'Lake George',
    artist: 'Georgia O\'Keeffe',
    year: '1922'
  },
  {
    url: '/hussain-horses.jpeg',
    alt: 'Hussain horses painting',
    title: 'Horses',
    artist: 'M.F. Husain',
    year: '1950s'
  },
  {
    url: '/picasso-marie.jpg',
    alt: 'Picasso portrait',
    title: 'Portrait of Marie-Thérèse',
    artist: 'Pablo Picasso',
    year: '1937'
  },
  {
    url: '/warhol-chair.jpg',
    alt: 'Warhol electric chair',
    title: 'Electric Chair',
    artist: 'Andy Warhol',
    year: '1964'
  },
  {
    url: '/warhol-crash.jpg',
    alt: 'Warhol car crash',
    title: 'Orange Car Crash',
    artist: 'Andy Warhol',
    year: '1963'
  },
  {
    url: '/condo-faces.jpg',
    alt: 'Condo faces painting',
    title: 'East Village Figures',
    artist: 'George Condo',
    year: '2000s'
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