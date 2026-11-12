import { useEffect, useState } from 'react'
import { bookPage, site } from '../../content/site'
import { addDays, addMonths, formatDay, hipcampLink, quoteStay, todayIso, type Stay } from '../../content/booking'
import Icon from '../Icon'

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

type Props = { layout?: 'row' | 'stack' | 'split' }

// Dates, sites and guests, a live price, and the hand-off to Hipcamp.
const BookingForm = ({ layout = 'stack' }: Props) => {
  const [stay, setStay] = useState<Stay>({ arrive: '', depart: '', sites: 1, guests: 2 })
  // Today's date is only known in the browser (the page is pre-rendered).
  const [today, setToday] = useState('')
  useEffect(() => setToday(todayIso()), [])

  const update = (patch: Partial<Stay>) => setStay((s) => ({ ...s, ...patch }))
  const quote = quoteStay(stay, today || '0000-00-00')
  const latest = today ? addMonths(today, site.bookingWindowMonths) : undefined

  const onArrive = (arrive: string) => {
    // Keep the departure after the arrival; default to one night.
    const depart = !stay.depart || stay.depart <= arrive ? (arrive ? addDays(arrive, 1) : '') : stay.depart
    update({ arrive, depart })
  }

  return (
    <form className={`bk-form bk-${layout}`} onSubmit={(e) => e.preventDefault()} aria-label="Plan your stay">
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
        <Stepper label="Sites" value={stay.sites} min={1} max={site.siteCount} onChange={(sites) => update({ sites })} />
        <Stepper label="Guests" value={stay.guests} min={1} max={site.siteCount * 6} onChange={(guests) => update({ guests })} />
      </div>
      <p className="bk-sites-help">{bookPage.sitesHelp}</p>

      <div className="bk-side">
        <div className="bk-summary" aria-live="polite">
          {quote.ok ? (
            <>
              <p className="bk-dates">
                <Icon name="calendar" size={18} />
                {formatDay(stay.arrive)} to {formatDay(stay.depart)}
              </p>
              <dl className="bk-lines">
                <div>
                  <dt>
                    {money(site.pricePerSiteNight)} &times; {stay.sites} {stay.sites === 1 ? 'site' : 'sites'} &times; {quote.nights}{' '}
                    {quote.nights === 1 ? 'night' : 'nights'}
                  </dt>
                  <dd>{money(quote.total)}</dd>
                </div>
                <div className="bk-total">
                  <dt>Total before fees</dt>
                  <dd>{money(quote.total)}</dd>
                </div>
              </dl>
              <p className="bk-fees">{bookPage.feesNote}</p>
            </>
          ) : quote.message ? (
            <p className="bk-error" role="alert">{quote.message}</p>
          ) : (
            <p className="bk-prompt">
              <span className="bk-price">{money(site.pricePerSiteNight)}</span>
              <span>per site per night. Pick your dates to see your total.</span>
            </p>
          )}
        </div>

        <a href={hipcampLink(stay, quote)} className="hero-btn primary bk-cta" target="_blank" rel="noopener">
          {bookPage.handoffLabel}
        </a>
        <p className="bk-handoff">{bookPage.handoffNote}</p>
      </div>
    </form>
  )
}

export default BookingForm
