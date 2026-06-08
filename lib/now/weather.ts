import type { SourceResult, Weather } from './types'

/**
 * Ambient "In SF" source via Open-Meteo (free, no API key). Pulls current
 * temperature + conditions, US AQI, and today's sunset to derive a golden-hour
 * time and remaining daylight. Needs no credentials, so it never reports
 * `unconfigured` — only `ok` or `empty` (on a network/parse failure).
 */

// San Francisco.
const LAT = 37.7749
const LON = -122.4194
const TZ = 'America/Los_Angeles'
const REVALIDATE = 600
/** Golden hour starts roughly this many minutes before sunset. */
const GOLDEN_OFFSET_MIN = 40

const now = () => new Date().toISOString()

const FORECAST_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,weather_code,is_day&daily=sunrise,sunset` +
  `&temperature_unit=fahrenheit&timezone=${encodeURIComponent(TZ)}&forecast_days=1`

const AQI_URL =
  `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}` +
  `&current=us_aqi&timezone=${encodeURIComponent(TZ)}`

/** WMO weather interpretation codes → short human conditions. */
function conditionFor(code: number): string {
  if (code === 0) return 'Clear'
  if (code === 1) return 'Mainly clear'
  if (code === 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if (code === 45 || code === 48) return 'Foggy'
  if (code >= 51 && code <= 57) return 'Drizzle'
  if (code >= 61 && code <= 67) return 'Rain'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Rain showers'
  if (code >= 85 && code <= 86) return 'Snow showers'
  if (code >= 95) return 'Thunderstorm'
  return 'Unsettled'
}

function aqiLabelFor(aqi: number): string {
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy for sensitive'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very unhealthy'
  return 'Hazardous'
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
  })
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

type Forecast = {
  current?: { temperature_2m?: number; weather_code?: number; is_day?: number }
  daily?: { sunrise?: string[]; sunset?: string[] }
}
type AirQuality = { current?: { us_aqi?: number } }

export async function getWeather(): Promise<SourceResult<Weather>> {
  const [forecast, air] = await Promise.all([
    getJson<Forecast>(FORECAST_URL),
    getJson<AirQuality>(AQI_URL),
  ])

  const temp = forecast?.current?.temperature_2m
  const code = forecast?.current?.weather_code
  const sunriseIso = forecast?.daily?.sunrise?.[0]
  const sunsetIso = forecast?.daily?.sunset?.[0]

  if (temp === undefined || code === undefined || !sunriseIso || !sunsetIso) {
    return { state: 'empty', data: null, fetchedAt: now() }
  }

  const sunriseMs = new Date(sunriseIso).getTime()
  const sunsetMs = new Date(sunsetIso).getTime()
  const goldenMs = sunsetMs - GOLDEN_OFFSET_MIN * 60_000
  const nowMs = Date.now()
  const daylightLeftMin = Math.max(0, Math.round((sunsetMs - nowMs) / 60_000))

  // Fraction of the way from sunrise → sunset; null outside daylight so the
  // arc can show a dimmed, sun-less night state instead of a clamped dot.
  const span = sunsetMs - sunriseMs
  const dayFraction =
    span > 0 && nowMs >= sunriseMs && nowMs <= sunsetMs
      ? (nowMs - sunriseMs) / span
      : null

  const aqiRaw = air?.current?.us_aqi
  const aqi = typeof aqiRaw === 'number' ? Math.round(aqiRaw) : null

  return {
    state: 'ok',
    data: {
      temperatureF: Math.round(temp),
      condition: conditionFor(code),
      aqi,
      aqiLabel: aqi !== null ? aqiLabelFor(aqi) : null,
      sunset: timeLabel(sunsetIso),
      goldenHour: timeLabel(new Date(goldenMs).toISOString()),
      daylightLeftMin,
      isDaytime: forecast?.current?.is_day === 1,
      dayFraction,
    },
    fetchedAt: now(),
  }
}
