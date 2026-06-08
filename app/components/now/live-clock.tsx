'use client'

import { useEffect, useState } from 'react'

const TZ = 'America/Los_Angeles'

function sfNow(): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date())
}

/** Ticking San Francisco clock for the /now header — makes the page feel live. */
export function LiveClock() {
  // Render empty on the server / first paint to avoid hydration mismatch, then
  // hydrate to the real local time and tick once a minute.
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    setTime(sfNow())
    const id = setInterval(() => setTime(sfNow()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="font-mono text-xs text-subtle" suppressHydrationWarning>
      {time ? `${time} · San Francisco` : '\u00a0'}
    </span>
  )
}
