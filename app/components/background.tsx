'use client'

interface BackgroundImage {
  url: string;
  alt: string;
}

// Array of background images
const backgrounds: BackgroundImage[] = [
  {
    url: '/background-1.jpeg',
    alt: 'Abstract sunset with floating figures'
  }
  // Add more backgrounds as needed
]

export default function Background() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-[#111] overflow-hidden">
      <img
        src={backgrounds[0].url}
        alt={backgrounds[0].alt}
        className="absolute w-full h-full object-cover object-center select-none"
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