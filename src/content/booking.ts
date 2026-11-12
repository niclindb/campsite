import { site } from './site'

// Date and price helpers for the booking form. Dates are plain
// "YYYY-MM-DD" strings, as used by <input type="date">, and are always
// handled as calendar days in UTC so time zones can't shift them.

const DAY = 86_400_000

const toTime = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const toIso = (time: number) => new Date(time).toISOString().slice(0, 10)

export const todayIso = () => {
  const now = new Date()
  return toIso(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

export const addDays = (iso: string, days: number) => toIso(toTime(iso) + days * DAY)

export const addMonths = (iso: string, months: number) => {
  const d = new Date(toTime(iso))
  d.setUTCMonth(d.getUTCMonth() + months)
  return toIso(d.getTime())
}

export const nightsBetween = (arrive: string, depart: string) =>
  Math.round((toTime(depart) - toTime(arrive)) / DAY)

const month = (iso: string) => Number(iso.slice(5, 7))

// The night of `iso` falls inside the season.
const inSeason = (iso: string) => month(iso) >= site.seasonOpenMonth && month(iso) <= site.seasonCloseMonth

// e.g. "Fri, Jun 12"
export const formatDay = (iso: string) =>
  new Date(toTime(iso)).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

export type Stay = { arrive: string; depart: string; sites: number; guests: number }

export type Quote =
  | { ok: false; message: string | null }
  | { ok: true; nights: number; perNight: number; total: number }

// Checks a stay against the camp's rules and prices it. `message` is null
// while the guest simply hasn't picked both dates yet.
export const quoteStay = (stay: Stay, today: string): Quote => {
  const { arrive, depart, sites } = stay
  if (!arrive || !depart) return { ok: false, message: null }
  if (arrive < today) return { ok: false, message: 'Your arrival date has already passed.' }
  if (arrive > addMonths(today, site.bookingWindowMonths))
    return { ok: false, message: `We take bookings ${site.bookingWindow.toLowerCase()}.` }
  const nights = nightsBetween(arrive, depart)
  if (nights < site.minNights) return { ok: false, message: 'Your departure needs to be after your arrival.' }
  // Every night must be in one season: the first and last nights (the last is
  // the day before departure) both in season, and in the same year.
  const lastNight = addDays(depart, -1)
  if (!inSeason(arrive) || !inSeason(lastNight) || arrive.slice(0, 4) !== lastNight.slice(0, 4))
    return { ok: false, message: `We’re open ${site.season}. Please choose dates in season.` }
  const perNight = site.pricePerSiteNight * sites
  return { ok: true, nights, perNight, total: perNight * nights }
}

// The Hipcamp listing with the stay filled in, so guests land on their dates.
export const hipcampLink = (stay: Stay, quote: Quote) => {
  const url = new URL(site.hipcampUrl)
  url.searchParams.set('adults', String(stay.guests))
  if (quote.ok) {
    url.searchParams.set('arrive', stay.arrive)
    url.searchParams.set('depart', stay.depart)
  }
  return url.toString()
}
