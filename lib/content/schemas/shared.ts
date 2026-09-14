import { z } from 'zod'

export const routeSegmentSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'must be a lowercase kebab-case route segment',
  )

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(?:T.*)?$/, 'must start with YYYY-MM-DD')
  .refine((value) => {
    const date = value.slice(0, 10)
    const parsedDate = new Date(`${date}T00:00:00.000Z`)
    if (!Number.isFinite(parsedDate.getTime())) return false
    if (parsedDate.toISOString().slice(0, 10) !== date) return false
    return !value.includes('T') || Number.isFinite(Date.parse(value))
  }, 'must be a real ISO date or datetime')
