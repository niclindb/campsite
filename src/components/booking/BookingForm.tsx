import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { addOns, bookPage, site } from '../../content/site'
import { addDays, addMonths, formatDay, pickedAddOns, quoteStay, todayIso, type Stay } from '../../content/booking'
import Icon from '../Icon'
import ArrowIcon from '../ArrowIcon'

// Booking requests are emailed to the hosts through Formspree.
const formId = import.meta.env.VITE_BOOKING_FORMSPREE_ID || bookPage.formspreeId

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

const money = (n: number) => `$${n.toLocaleString('en-US')}`
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

type Details = { name: string; email: string; phone: string; note: string }
type Status = 'idle' | 'sending' | 'sent' | 'error'

const emptyStay: Stay = { arrive: '', depart: '', sites: 1, guests: 2, extras: [] }
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
  // Errors show after the first Send attempt, then update as people fix them.
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const successRef = useRef<HTMLHeadingElement>(null)
  // Today's date is only known in the browser (the page is pre-rendered).
  const [today, setToday] = useState('')
  useEffect(() => setToday(todayIso()), [])
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

  const onArrive = (arrive: string) => {
    // Keep the departure after the arrival; default to one night.
    const depart = !stay.depart || stay.depart <= arrive ? (arrive ? addDays(arrive, 1) : '') : stay.depart
    update({ arrive, depart })
  }
  // Fewer sites can hold fewer guests.
  const onSites = (sites: number) => update({ sites, guests: Math.min(stay.guests, sites * site.maxGuestsPerSite) })
  const toggleExtra = (name: string) =>
    update({ extras: stay.extras.includes(name) ? stay.extras.filter((x) => x !== name) : [...stay.extras, name] })
  const onDetail = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDetails((d) => ({ ...d, [e.target.name]: e.target.value }))

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'sending') return
    setSubmitted(true)
    if (!quote.ok) {
      e.currentTarget.querySelector<HTMLElement>('input[type=date]')?.focus()
      return
    }
    const firstBad = (['name', 'email'] as const).find((f) => errors[f])
    if (firstBad) {
      e.currentTarget.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus()
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
    body.set('Extras', extras.length ? extras.map((a) => `${a.name} (${money(a.price)})`).join(', ') : 'None')
    body.set('Total', money(quote.total))
    body.set('Name', details.name.trim())
    body.set('Email', details.email.trim())
    body.set('Phone', details.phone.trim() || 'Not given')
    body.set('Note', details.note.trim() || 'None')
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

  return (
    <form className="bk-form" onSubmit={onSubmit} noValidate aria-busy={status === 'sending'} aria-label="Booking request">
      <div className="bk-main">
        <fieldset className="bk-group">
          <legend>{bookPage.stayTitle}</legend>
          <div className="bk-fields">
            <label className="bk-field">
              <span className="bk-label">Arrive</span>
              <input type="date" value={stay.arrive} min={today || undefined} max={latest} onChange={(e) => onArrive(e.target.value)} />
            </label>
            <label className="bk-field">
              <span className="bk-label">Depart</span>
              <input
                type="date"
                value={stay.depart}
                min={stay.arrive ? addDays(stay.arrive, 1) : today || undefined}
                onChange={(e) => update({ depart: e.target.value })}
              />
            </label>
            <Stepper label="Sites" value={stay.sites} min={1} max={site.siteCount} onChange={onSites} />
            <Stepper label="Guests" value={stay.guests} min={1} max={maxGuests} onChange={(guests) => update({ guests })} />
          </div>
          <p className="bk-help">{bookPage.sitesHelp}</p>
        </fieldset>

        <fieldset className="bk-group">
          <legend>{bookPage.addOnsTitle}</legend>
          <p className="bk-help">{bookPage.addOnsNote}</p>
          <div className="bk-extras">
            {addOns.map((a) => (
              <label key={a.name} className={`bk-extra${stay.extras.includes(a.name) ? ' is-on' : ''}`}>
                <input type="checkbox" checked={stay.extras.includes(a.name)} onChange={() => toggleExtra(a.name)} />
                <span className="bk-extra-text">
                  <span className="bk-extra-name">{a.name}</span>
                  <span className="bk-extra-note">{a.note}</span>
                </span>
                <span className="bk-extra-price">{money(a.price)}</span>
              </label>
            ))}
          </div>
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

      <aside className="bk-side" aria-live="polite">
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
              {extras.map((a) => (
                <div key={a.name}>
                  <dt>{a.name}</dt>
                  <dd>{money(a.price)}</dd>
                </div>
              ))}
              <div className="bk-total">
                <dt>Total</dt>
                <dd>{money(quote.total)}</dd>
              </div>
            </dl>
            <p className="bk-guests">{plural(stay.guests, 'guest')}</p>
          </>
        ) : quote.message ? (
          <p className="bk-error" role="alert">{quote.message}</p>
        ) : (
          <p className="bk-prompt">
            <span className="bk-price">{money(site.pricePerSiteNight)}</span>
            <span>per site per night. {submitted ? 'Please pick your dates first.' : 'Pick your dates to see your total.'}</span>
          </p>
        )}

        {status === 'error' && <p className="bk-error" role="alert">{bookPage.errorText}</p>}

        <button type="submit" className="hero-btn primary bk-cta" disabled={status === 'sending'}>
          {status === 'sending' ? bookPage.sendingLabel : bookPage.submitLabel}
        </button>
        <p className="bk-handoff">{bookPage.payNote}</p>
        <a className="arrow-link bk-hipcamp" href={site.hipcampUrl} target="_blank" rel="noopener">
          {bookPage.hipcampLabel} <ArrowIcon />
        </a>
      </aside>
    </form>
  )
}

export default BookingForm
