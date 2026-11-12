import { addOns, site, type AddOn } from './site.js'

// Date and price helpers for the booking form. Dates are plain
// "YYYY-MM-DD" strings, as used by <input type="date">, and are always
// handled as calendar days in UTC so time zones can't shift them.

const DAY = 86_400_000

const toTime = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const toIso = (time: number) => new Date(time).toISOString().slice(0, 10)

// Today's date in the camp's time zone (Michigan), so "today" is the same for
// a guest in Michigan and for the server.
export const todayIso = (now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: site.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)

export const addDays = (iso: string, days: number) => toIso(toTime(iso) + days * DAY)

export const addMonths = (iso: string, months: number) => {
  const d = new Date(toTime(iso))
  d.setUTCMonth(d.getUTCMonth() + months)
  return toIso(d.getTime())
}

export const nightsBetween = (arrive: string, depart: string) =>
  Math.round((toTime(depart) - toTime(arrive)) / DAY)

// e.g. "Fri, Jun 12"
export const formatDay = (iso: string) =>
  new Date(toTime(iso)).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

// `extras` maps an add-on's name to how many the guest wants.
export type Stay = { arrive: string; depart: string; sites: number; guests: number; extras: Record<string, number> }

export type Picked = { addOn: AddOn; qty: number }

// The most of an add-on one booking can take (per-site add-ons are capped by sites).
export const maxFor = (a: AddOn, sites: number) => (a.perSite ? Math.min(a.max, sites) : a.max)

// The add-ons picked, in menu order, with quantities kept within each one's limit.
export const pickedAddOns = (stay: Stay): Picked[] =>
  addOns
    .map((addOn) => ({ addOn, qty: Math.min(Math.floor(Number(stay.extras[addOn.name]) || 0), maxFor(addOn, stay.sites)) }))
    .filter((p) => p.qty > 0)

// Electric hookups in a stay (one per site, 2 a night in all).
export const hookupsIn = (stay: Stay) => pickedAddOns(stay).find((p) => p.addOn.hookup)?.qty ?? 0

// e.g. "Canoe × 2"
export const pickedLabel = (name: string, qty: number) => (qty > 1 ? `${name} \u00d7 ${qty}` : name)

export type Quote =
  // `guests` marks the one problem that isn't about the dates.
  | { ok: false; message: string | null; guests?: true }
  | {
      ok: true
      nights: number
      sitesTotal: number
      extrasTotal: number
      // Dollars. `tax` can have cents; `taxCents` and `totalCents` are exact.
      tax: number
      taxCents: number
      total: number
      totalCents: number
    }

// Sales tax in cents on the taxable part of a stay, rounded to the cent.
export const taxCentsOn = (taxableDollars: number) => Math.round(taxableDollars * site.salesTaxPercent)

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
  if (nights > site.maxNights)
    return { ok: false, message: `Stays can be up to ${site.maxNights} nights. For a longer stay, please contact us.` }
  if (stay.guests > sites * site.maxGuestsPerSite)
    return { ok: false, message: `Each site fits up to ${site.maxGuestsPerSite} guests. Add a site for a bigger group.`, guests: true }
  const sitesTotal = site.pricePerSiteNight * sites * nights
  const picked = pickedAddOns(stay)
  const extrasTotal = picked.reduce((sum, p) => sum + p.addOn.price * p.qty, 0)
  const taxFreeTotal = picked.reduce((sum, p) => sum + (p.addOn.taxFree ? p.addOn.price * p.qty : 0), 0)
  const taxCents = taxCentsOn(sitesTotal + extrasTotal - taxFreeTotal)
  const totalCents = (sitesTotal + extrasTotal) * 100 + taxCents
  return { ok: true, nights, sitesTotal, extrasTotal, tax: taxCents / 100, taxCents, total: totalCents / 100, totalCents }
}
