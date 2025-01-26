'use client'

import { useBackground } from 'app/context/BackgroundContext'

export default function Background() {
  const { currentIndex, backgrounds } = useBackground()

  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-[#111] overflow-hidden">
      <img
        src={backgrounds[currentIndex].url}
        alt={backgrounds[currentIndex].alt}
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