import { getWeather } from 'lib/now/weather'
import { NowEmpty, NowTile } from './now-tile'

const EYEBROW = 'In SF'

// Semicircle arc: center (60,60), radius 50 → spans x:10→110, peaks at y:10.
const ARC = 'M 10 60 A 50 50 0 0 1 110 60'

/** Round to 1 decimal — SVG sub-pixel precision beyond this just bloats markup. */
const round1 = (n: number) => Math.round(n * 10) / 10

function sunPosition(fraction: number): { x: number; y: number } {
  const rad = ((180 - 180 * fraction) * Math.PI) / 180
  return {
    x: round1(60 + 50 * Math.cos(rad)),
    y: round1(60 - 50 * Math.sin(rad)),
  }
}

function SunArc({ fraction }: { fraction: number | null }) {
  const sun = fraction !== null ? sunPosition(fraction) : null
  return (
    <svg
      viewBox="0 0 120 66"
      className="w-full max-w-48"
      fill="none"
      aria-hidden="true"
    >
      <line
        x1={6}
        y1={60}
        x2={114}
        y2={60}
        stroke="var(--color-border-soft)"
        strokeWidth={1}
        strokeDasharray="2 3"
      />
      <circle cx={10} cy={60} r={2} fill="var(--color-border)" />
      <circle cx={110} cy={60} r={2} fill="var(--color-border)" />
      <path d={ARC} stroke="var(--color-border)" strokeWidth={1.5} />
      {fraction !== null ? (
        <path
          d={ARC}
          stroke="var(--color-accent)"
          strokeWidth={1.5}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${fraction * 100} 100`}
        />
      ) : null}
      {sun ? (
        <>
          <circle cx={sun.x} cy={sun.y} r={7} fill="var(--color-accent-soft)" />
          <circle cx={sun.x} cy={sun.y} r={4} fill="var(--color-accent)" />
        </>
      ) : null}
    </svg>
  )
}

export async function SfTile() {
  const { state, data, fetchedAt } = await getWeather()

  if (state !== 'ok' || !data) {
    return (
      <NowTile eyebrow={EYEBROW} fetchedAt={fetchedAt}>
        <NowEmpty state={state} label="Weather" />
      </NowTile>
    )
  }

  return (
    <NowTile eyebrow={EYEBROW} fetchedAt={fetchedAt}>
      <div className="flex h-full flex-col gap-2">
        <p className="leading-none">
          <span className="font-serif text-4xl tracking-tight text-ink">
            {data.temperatureF}°
          </span>{' '}
          <span className="text-sm text-muted">{data.condition}</span>
        </p>

        <div className="flex items-end justify-center py-1">
          <SunArc fraction={data.dayFraction} />
        </div>

        <p className="mt-auto font-mono text-[0.7rem] uppercase tracking-wider text-subtle">
          {data.dayFraction !== null
            ? `golden hour ${data.goldenHour}`
            : `sets ${data.sunset}`}
          {data.aqi !== null ? ` · AQI ${data.aqi}` : ''}
        </p>
      </div>
    </NowTile>
  )
}
