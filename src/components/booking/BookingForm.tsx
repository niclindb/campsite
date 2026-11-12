import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { addOns, bookPage, site, type AddOn } from '../../content/site'
import { legal, termsCheckbox } from '../../content/legal'
import { addMonths, formatDay, hookupsIn, maxFor, pickedAddOns, pickedLabel, quoteStay, todayIso, type Stay } from '../../content/booking'
import Icon from '../Icon'
import ArrowIcon from '../ArrowIcon'
import { instantBooking } from './instant'
import DateRangePicker from './DateRangePicker'

// Booking requests are emailed to the hosts through Formspree.
const formId = import.meta.env.VITE_BOOKING_FORMSPREE_ID || bookPage.formspreeId

// Free sites and hookups across every night of the chosen dates.
type Availability =
  | { state: 'idle' | 'loading' | 'error' }
  | { state: 'ready'; sitesFree: number; hookupsFree: number; fullNights: string[]; items: Record<string, number> }

type StepperProps = { label: string; value: number; min: number; max: number; onChange: (n: number) => void }

// A number picker with - and + buttons, for sites and guests.
const Stepper = ({ label, value, min, max, onChange }: StepperProps) => (
  <div className="bk-field">
    <span className="bk-label" id={`bk-${label}`}>{label}</span>
    <div className="bk-stepper" role="group" aria-labelledby={`bk-${label}`}>
      <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
        &minus;
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" aria-label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  </div>
)

// e.g. "$84" or "$89.04"
const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

type Details = { name: string; email: string; phone: string; note: string }
type Status = 'idle' | 'sending' | 'sent' | 'error'

const emptyStay: Stay = { arrive: '', depart: '', sites: 1, guests: 2, extras: {} }
const emptyDetails: Details = { name: '', email: '', phone: '', note: '' }
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const detailErrors = (d: Details) => {
  const e: Partial<Record<keyof Details, string>> = {}
  if (!d.name.trim()) e.name = 'Please tell us your name.'
  if (!d.email.trim()) e.email = 'We need your email to confirm your booking.'
  else if (!emailPattern.test(d.email.trim())) e.email = 'That email doesn’t look quite right.'
  return e
}

// Dates, sites, guests and extras with a live total, then the guest's
// details. Sends a booking request that the hosts confirm by email.
const BookingForm = () => {
  const [stay, setStay] = useState<Stay>(emptyStay)
  const [details, setDetails] = useState<Details>(emptyDetails)
  // The guest has ticked the terms and privacy box (checked again on the server).
  const [agreed, setAgreed] = useState(false)
  // Errors show after the first Send attempt, then update as people fix them.
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState('')
  const [notice, setNotice] = useState('')
  const [avail, setAvail] = useState<Availability>({ state: 'idle' })
  const successRef = useRef<HTMLHeadingElement>(null)
  const agreeRef = useRef<HTMLDivElement>(null)
  // The terms box shakes when someone tries to book without ticking it.
  const [shake, setShake] = useState(false)
  // Today's date is only known in the browser (the page is pre-rendered).
  const [today, setToday] = useState('')
  useEffect(() => setToday(todayIso()), [])

  // Back from an unpaid Stripe page: release the held sites.
  useEffect(() => {
    if (!instantBooking) return
    const params = new URLSearchParams(window.location.search)
    const cancelled = params.get('cancelled')
    if (!cancelled) return
    setNotice(bookPage.instant.cancelledNote)
    fetch('/api/cancel-hold', { method: 'POST', body: JSON.stringify({ bookingId: cancelled }) }).catch(() => {})
    window.history.replaceState(null, '', window.location.pathname)
  }, [])
  useEffect(() => {
    if (status !== 'sent') return
    // Bring the thank-you into view (below the sticky header) and focus it.
    document.getElementById('book')?.scrollIntoView({ block: 'start' })
    successRef.current?.focus({ preventScroll: true })
  }, [status])

  const update = (patch: Partial<Stay>) => setStay((s) => ({ ...s, ...patch }))
  const quote = quoteStay(stay, today || '0000-00-00')
  const latest = today ? addMonths(today, site.bookingWindowMonths) : undefined
  const errors = detailErrors(details)
  const shown = (f: keyof Details) => (submitted ? errors[f] : undefined)
  const extras = pickedAddOns(stay)
  const maxGuests = stay.sites * site.maxGuestsPerSite
  const ready = avail.state === 'ready' ? avail : null
  const maxSites = ready ? Math.max(1, Math.min(site.siteCount, ready.sitesFree)) : site.siteCount
  // How many of an add-on are still free on every night (rentals and hookups).
  const freeOf = (a: AddOn) =>
    !ready ? Infinity : a.hookup ? ready.hookupsFree : a.perNight ? (ready.items[a.name] ?? a.perNight) : Infinity
  const itemsShort = extras.some((p) => p.qty > freeOf(p.addOn))
  const hookupsShort = !!ready && hookupsIn(stay) > ready.hookupsFree
  const soldOut = !!ready && (ready.sitesFree < stay.sites || itemsShort)
  const fullMessage = ready && ready.sitesFree === 0
    ? `${bookPage.instant.fullOn} ${ready.fullNights.map(formatDay).join(', ')}. ${bookPage.instant.tryOther}`
    : ''
  // Shown right on the dates field, where the guest fixes it.
  const datesError =
    !quote.ok && quote.message && !quote.guests
      ? quote.message
      : !stay.arrive || !stay.depart
        ? submitted ? bookPage.pickDatesError : undefined
        : fullMessage || undefined

  // Live availability for the chosen dates.
  const { arrive, depart } = stay
  const datesOk = quote.ok
  useEffect(() => {
    if (!instantBooking || !datesOk) {
      setAvail({ state: 'idle' })
      return
    }
    const controller = new AbortController()
    setAvail({ state: 'loading' })
    fetch(`/api/availability?arrive=${arrive}&depart=${depart}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { nights: { night: string; sitesFree: number; hookupsFree: number }[]; items?: Record<string, number> }) =>
        setAvail({
          state: 'ready',
          sitesFree: Math.min(...d.nights.map((n) => n.sitesFree)),
          hookupsFree: Math.min(...d.nights.map((n) => n.hookupsFree)),
          fullNights: d.nights.filter((n) => n.sitesFree === 0).map((n) => n.night),
          items: d.items ?? {},
        }),
      )
      .catch((err: Error) => err.name !== 'AbortError' && setAvail({ state: 'error' }))
    return () => controller.abort()
  }, [arrive, depart, datesOk])

  // Fewer sites can hold fewer guests.
  const onSites = (sites: number) => update({ sites, guests: Math.min(stay.guests, sites * site.maxGuestsPerSite) })
  const setExtra = (name: string, qty: number) => {
    const extras = { ...stay.extras }
    if (qty > 0) extras[name] = qty
    else delete extras[name]
    update({ extras })
  }
  const onDetail = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDetails((d) => ({ ...d, [e.target.name]: e.target.value }))

  // Everything still missing before the guest can book, in page order.
  // Each item jumps to the field that fixes it.
  const needed: { label: string; target: string }[] = []
  if (!quote.ok && !quote.guests) needed.push({ label: stay.arrive && stay.depart ? 'Different dates' : 'Your dates', target: '.bk-dates-trigger' })
  else if (fullMessage) needed.push({ label: 'Different dates (yours are full)', target: '.bk-dates-trigger' })
  if (!quote.ok && quote.guests) needed.push({ label: 'Another site for your group', target: '[aria-label="More sites"]' })
  if (ready && !fullMessage && ready.sitesFree < stay.sites) needed.push({ label: 'Fewer sites', target: '[aria-label="Fewer sites"]' })
  if (itemsShort) needed.push({ label: 'Fewer rentals or extras', target: '.bk-extra.is-short' })
  if (errors.name) needed.push({ label: 'Your name', target: '[name="name"]' })
  if (errors.email) needed.push({ label: details.email.trim() ? 'A valid email' : 'Your email', target: '[name="email"]' })
  if (!agreed) needed.push({ label: 'Tick the terms box', target: '[name="agreeTerms"]' })

  // Scroll to a field and focus it; the terms box also shakes.
  const jumpTo = (target: string) => {
    const el = document.querySelector<HTMLElement>(`.bk-form ${target}`)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
    const focusable = el.matches('button, input, textarea') ? el : el.querySelector<HTMLElement>('button, input')
    focusable?.focus({ preventScroll: true })
    if (target === '[name="agreeTerms"]') {
      setShake(false)
      requestAnimationFrame(() => setShake(true))
    }
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'sending') return
    setSubmitted(true)
    if (needed.length) {
      jumpTo(needed[0].target)
      return
    }
    // Already covered by `needed`; this narrows the type for the code below.
    if (!quote.ok) return

    if (instantBooking) {
      setStatus('sending')
      setServerError('')
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            ...stay,
            extras: Object.fromEntries(extras.map((p) => [p.addOn.name, p.qty])),
            ...details,
            agreedToTerms: agreed,
            termsVersion: legal.updated,
          }),
        })
        const data = (await res.json().catch(() => ({}))) as { url?: string; message?: string }
        if (res.ok && data.url) {
          window.location.assign(data.url)
          return
        }
        setServerError(data.message ?? '')
        setStatus('error')
      } catch {
        setStatus('error')
      }
      return
    }

    const body = new FormData()
    body.set('_subject', `${bookPage.emailSubject}: ${formatDay(stay.arrive)} to ${formatDay(stay.depart)}, ${plural(stay.sites, 'site')}`)
    body.set('_replyto', details.email.trim())
    body.set('Arrive', stay.arrive)
    body.set('Depart', stay.depart)
    body.set('Nights', String(quote.nights))
    body.set('Sites', String(stay.sites))
    body.set('Guests', String(stay.guests))
    body.set('Extras', extras.length ? extras.map((p) => `${p.addOn.kind === 'rental' ? 'Rental: ' : ''}${pickedLabel(p.addOn.name, p.qty)} (${money(p.addOn.price * p.qty)})`).join(', ') : 'None')
    body.set('Sales tax', money(quote.tax))
    body.set('Total', money(quote.total))
    body.set('Name', details.name.trim())
    body.set('Email', details.email.trim())
    body.set('Phone', details.phone.trim() || 'Not given')
    body.set('Note', details.note.trim() || 'None')
    body.set('Agreed to terms and privacy policy', `Yes (version ${legal.updated})`)
    body.set('_gotcha', (e.currentTarget.elements.namedItem('_gotcha') as HTMLInputElement | null)?.value ?? '')

    setStatus('sending')
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    try {
      const res = await fetch(`https://formspree.io/f/${formId}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body,
        signal: controller.signal,
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    } finally {
      clearTimeout(timer)
    }
  }

  const reset = () => {
    setStay(emptyStay)
    setDetails(emptyDetails)
    setAgreed(false)
    setSubmitted(false)
    setStatus('idle')
  }

  if (status === 'sent') {
    return (
      <div className="bk-success" role="status">
        <span className="bk-success-icon"><Icon name="tent" size={36} /></span>
        <h2 ref={successRef} tabIndex={-1}>{bookPage.successTitle}</h2>
        <p>{bookPage.successText}</p>
        <button type="button" className="bk-again" onClick={reset}>{bookPage.anotherLabel}</button>
      </div>
    )
  }

  const errorFor = (f: keyof Details) =>
    shown(f) && <span className="bk-field-error" id={`bk-${f}-error`}>{shown(f)}</span>
  const detailProps = (f: keyof Details) => ({
    id: `bk-${f}`,
    name: f,
    value: details[f],
    onChange: onDetail,
    'aria-invalid': shown(f) ? true : undefined,
    'aria-describedby': shown(f) ? `bk-${f}-error` : undefined,
  })

  // One add-on: a checkbox when only one can be taken, otherwise a - / + picker.
  const extraRow = (a: AddOn) => {
    const qty = Math.min(stay.extras[a.name] ?? 0, maxFor(a, stay.sites))
    const free = freeOf(a)
    const most = Math.max(0, Math.min(maxFor(a, stay.sites), free))
    // None left on one of the nights: can't add it.
    const gone = qty === 0 && most === 0 && !!ready
    const short = qty > free
    const note = gone || short
      ? a.hookup ? bookPage.instant.hookupsGone : bookPage.instant.rentalGone
      : a.note
    const tag = a.kind === 'rental' ? <span className="bk-tag">{bookPage.rentalLabel}</span> : null
    const price = <span className="bk-extra-price">{money(a.price)}{a.perSite ? <small> / site</small> : null}</span>
    const cls = `bk-extra${qty ? ' is-on' : ''}${gone ? ' is-gone' : ''}${short ? ' is-short' : ''}`
    if (a.max === 1) {
      return (
        <label key={a.name} className={cls}>
          <input type="checkbox" checked={qty > 0} disabled={gone} onChange={() => setExtra(a.name, qty ? 0 : 1)} />
          <span className="bk-extra-text">
            <span className="bk-extra-name">{a.name} {tag}</span>
            <span className="bk-extra-note">{note}</span>
          </span>
          {price}
        </label>
      )
    }
    return (
      <div key={a.name} className={`${cls} has-qty`}>
        <span className="bk-extra-text">
          <span className="bk-extra-name" id={`bk-x-${a.name}`}>{a.name} {tag}</span>
          <span className="bk-extra-note">{note}</span>
          {price}
        </span>
        <div className="bk-qty" role="group" aria-labelledby={`bk-x-${a.name}`}>
          <button type="button" aria-label={`Fewer: ${a.name}`} disabled={qty <= 0} onClick={() => setExtra(a.name, qty - 1)}>
            &minus;
          </button>
          <output aria-live="polite">{qty}</output>
          <button type="button" aria-label={`More: ${a.name}`} disabled={qty >= most} onClick={() => setExtra(a.name, qty + 1)}>
            +
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="bk-form" onSubmit={onSubmit} noValidate aria-busy={status === 'sending'} aria-label="Booking request">
      <div className="bk-main">
        <fieldset className="bk-group">
          <legend>{bookPage.stayTitle}</legend>
          <div className="bk-fields">
            <DateRangePicker
              arrive={stay.arrive}
              depart={stay.depart}
              today={today}
              latest={latest}
              onChange={(arrive, depart) => update({ arrive, depart })}
              error={datesError}
            />
            <Stepper label="Sites" value={stay.sites} min={1} max={maxSites} onChange={onSites} />
            <Stepper label="Guests" value={stay.guests} min={1} max={maxGuests} onChange={(guests) => update({ guests })} />
          </div>
          <p className="bk-help">{bookPage.sitesHelp}</p>
        </fieldset>

        <fieldset className="bk-group">
          <legend>{bookPage.rentalsTitle}</legend>
          <p className="bk-help">{bookPage.rentalsNote}</p>
          <div className="bk-extras">{addOns.filter((a) => a.kind === 'rental').map(extraRow)}</div>
        </fieldset>

        <fieldset className="bk-group">
          <legend>{bookPage.addOnsTitle}</legend>
          <p className="bk-help">{bookPage.addOnsNote}</p>
          <div className="bk-extras">{addOns.filter((a) => a.kind !== 'rental').map(extraRow)}</div>
        </fieldset>

        <fieldset className="bk-group">
          <legend>{bookPage.detailsTitle}</legend>
          <div className="bk-fields bk-details">
            <div className="bk-field">
              <label className="bk-label" htmlFor="bk-name">Name</label>
              <input {...detailProps('name')} autoComplete="name" maxLength={100} />
              {errorFor('name')}
            </div>
            <div className="bk-field">
              <label className="bk-label" htmlFor="bk-email">Email</label>
              <input {...detailProps('email')} type="email" autoComplete="email" inputMode="email" maxLength={200} />
              {errorFor('email')}
            </div>
            <div className="bk-field">
              <label className="bk-label" htmlFor="bk-phone">Phone <span className="bk-optional">(optional)</span></label>
              <input {...detailProps('phone')} type="tel" autoComplete="tel" inputMode="tel" maxLength={40} />
            </div>
            <div className="bk-field bk-wide">
              <label className="bk-label" htmlFor="bk-note">Note <span className="bk-optional">(optional)</span></label>
              <textarea {...detailProps('note')} rows={3} maxLength={2000} placeholder={bookPage.notePlaceholder} />
            </div>
          </div>
          {/* Spam trap: hidden from people and screen readers; Formspree drops requests that fill it. */}
          <div className="bk-honeypot" aria-hidden="true">
            <label htmlFor="bk-gotcha">Leave this empty</label>
            <input id="bk-gotcha" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
          </div>
        </fieldset>
      </div>

      <div className="bk-side" aria-live="polite">
        <h2>{bookPage.summaryTitle}</h2>
        {quote.ok ? (
          <>
            <p className="bk-dates">
              <Icon name="calendar" size={18} />
              {formatDay(stay.arrive)} to {formatDay(stay.depart)}
            </p>
            <dl className="bk-lines">
              <div>
                <dt>
                  {money(site.pricePerSiteNight)} &times; {plural(stay.sites, 'site')} &times; {plural(quote.nights, 'night')}
                </dt>
                <dd>{money(quote.sitesTotal)}</dd>
              </div>
              {extras.map(({ addOn, qty }) => (
                <div key={addOn.name}>
                  <dt>
                    {pickedLabel(addOn.name, qty)}
                    {addOn.kind === 'rental' && <span className="bk-side-tag"> (rental)</span>}
                  </dt>
                  <dd>{money(addOn.price * qty)}</dd>
                </div>
              ))}
              {quote.taxCents > 0 && (
                <div>
                  <dt>Sales tax ({site.salesTaxPercent}%)</dt>
                  <dd>{money(quote.tax)}</dd>
                </div>
              )}
              <div className="bk-total">
                <dt>Total</dt>
                <dd>{money(quote.total)}</dd>
              </div>
            </dl>
            <p className="bk-guests">{plural(stay.guests, 'guest')}</p>
            {/* Only speak up when something's wrong: nothing to say when the dates are free. */}
            {instantBooking && (avail.state === 'error' || soldOut || (ready && ready.sitesFree === 0)) && (
              <p className={`bk-avail${soldOut ? ' is-out' : ''}`}>
                {avail.state === 'error' && bookPage.instant.checkFailed}
                {ready &&
                  (fullMessage
                    ? fullMessage
                    : soldOut && ready.sitesFree < stay.sites
                      ? `Only ${plural(ready.sitesFree, 'site')} free on every night. ${bookPage.instant.fewerSites}`
                      : soldOut
                        ? hookupsShort ? bookPage.instant.hookupsGone : bookPage.instant.itemsGone
                        : null)}
              </p>
            )}
          </>
        ) : quote.message ? (
          <p className="bk-error" role="alert">{quote.message}</p>
        ) : (
          <p className="bk-prompt">
            <span className="bk-price">{money(site.pricePerSiteNight)}</span>
            <span>per site per night. {submitted ? 'Please pick your dates first.' : 'Pick your dates to see your total.'}</span>
          </p>
        )}

        {notice && <p className="bk-notice">{notice}</p>}
        {status === 'error' && (
          <p className="bk-error" role="alert">
            {serverError || (instantBooking ? bookPage.instant.errorText : bookPage.errorText)}
          </p>
        )}

        <div
          ref={agreeRef}
          className={`bk-agree${submitted && !agreed ? ' is-missing' : ''}${agreed ? ' is-checked' : ''}${shake ? ' is-nudged' : ''}`}
          onAnimationEnd={() => setShake(false)}
        >
          <label>
            <input
              type="checkbox"
              name="agreeTerms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              aria-invalid={submitted && !agreed ? true : undefined}
              aria-describedby={submitted && !agreed ? 'bk-agree-error' : undefined}
            />
            <span>
              {termsCheckbox.before}
              {/* New tab, so the guest's choices stay filled in. */}
              <a href="/terms" target="_blank" rel="noopener">{termsCheckbox.termsLabel}</a>
              {termsCheckbox.middle}
              <a href="/privacy" target="_blank" rel="noopener">{termsCheckbox.privacyLabel}</a>
              {termsCheckbox.after}
            </span>
          </label>
          {submitted && !agreed && (
            <span className="bk-agree-error" id="bk-agree-error" role="alert">
              <span aria-hidden="true">!</span> {termsCheckbox.error}
            </span>
          )}
        </div>

        {/* Never disabled: a click shows what's still needed instead. */}
        <button type="submit" className="hero-btn primary bk-cta" disabled={status === 'sending'}>
          {status === 'sending'
            ? instantBooking ? bookPage.instant.sendingLabel : bookPage.sendingLabel
            : instantBooking
              ? quote.ok ? `${bookPage.instant.submitLabel} ${money(quote.total)}` : bookPage.instant.submitLabel
              : bookPage.submitLabel}
        </button>
        {submitted && needed.length > 0 && (
          <div className="bk-needed" role="status">
            <p>Still needed to book:</p>
            <ul>
              {needed.map((n) => (
                <li key={n.label}>
                  <button type="button" onClick={() => jumpTo(n.target)}>{n.label}</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="bk-handoff">{instantBooking ? bookPage.instant.payNote : bookPage.payNote}</p>
        <a className="arrow-link bk-hipcamp" href={site.hipcampUrl} target="_blank" rel="noopener">
          {bookPage.hipcampLabel} <ArrowIcon />
        </a>
      </div>
    </form>
  )
}

export default BookingForm
