'use client'

import { createContext, useContext, useState } from 'react'

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

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const backgrounds = [
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

  const [currentIndex, setCurrentIndex] = useState(0)

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