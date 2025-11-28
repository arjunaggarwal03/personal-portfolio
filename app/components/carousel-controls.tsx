'use client'

import { useBackground } from 'app/context/BackgroundContext'

export default function CarouselControls() {
  const { currentIndex, backgrounds } = useBackground()
  const currentArtwork = backgrounds[currentIndex]

  return (
    <div className="flex flex-col items-center space-y-1">
      <div className="text-sm text-neutral-700 dark:text-neutral-300 text-center">
        <span className="italic">{currentArtwork.title}</span>, {currentArtwork.year}
      </div>
      <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
        {currentArtwork.artist}
      </div>
    </div>
  )
} 