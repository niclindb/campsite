import { useEffect, useRef, useState } from 'react'
import { bookPage } from '../../content/site'
import { addDays, addMonths, formatDay } from '../../content/booking'
import Icon from '../Icon'

// One calendar for both dates: the first tap picks the arrival, the second
// the departure. Nothing is picked until the guest taps a day.

type Props = {
  arrive: string
  depart: string
  today: string
  latest?: string
  onChange: (arrive: string, depart: string) => void
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const firstOfMonth = (iso: string) => `${iso.slice(0, 7)}-01`
const monthTitle = (first: string) =>
  new Date(`${first}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const monthIso = (year: number, m: number) => `${year}-${String(m + 1).padStart(2, '0')}-01`
const longDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

// The first month worth showing: the arrival's, otherwise this month.
const startMonth = (arrive: string, today: string) => (arrive ? firstOfMonth(arrive) : today ? firstOfMonth(today) : '')

// The days of one month, padded with blanks so the 1st lands on its weekday.
const monthDays = (first: string) => {
  const blanks = new Date(`${first}T00:00:00Z`).getUTCDay()
  const next = addMonths(first, 1)
  const days: (string | null)[] = Array(blanks).fill(null)
  for (let d = first; d < next; d = addDays(d, 1)) days.push(d)
  return days
}

const DateRangePicker = ({ arrive, depart, today, latest, onChange }: Props) => {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('')
  // Tapping a month's name swaps the days for a month and year chooser.
  const [choosing, setChoosing] = useState(false)
  const [chooseYear, setChooseYear] = useState(0)
  const wrap = useRef<HTMLDivElement>(null)
  const pickingDepart = !!arrive && !depart

  // Close on a tap outside or Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      wrap.current?.querySelector<HTMLElement>('.bk-dates-trigger')?.focus()
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = () => {
    if (!open) setView(startMonth(arrive, today))
    setChoosing(false)
    setOpen(!open)
  }

  // A day can start a stay if it's bookable; it can end one if it's after the arrival.
  const canArrive = (d: string) => (!today || d >= today) && (!latest || d <= latest)
  const canDepart = (d: string) => d > arrive
  const enabled = (d: string) => (pickingDepart ? canDepart(d) || canArrive(d) : canArrive(d))

  const pick = (d: string) => {
    if (pickingDepart && canDepart(d)) {
      onChange(arrive, d)
      setOpen(false)
    } else {
      onChange(d, '')
    }
  }

  const firstAllowed = today ? firstOfMonth(today) : ''
  const lastAllowed = latest ? firstOfMonth(latest) : ''
  const months = view ? [view, addMonths(view, 1)] : []
  const firstYear = firstAllowed ? Number(firstAllowed.slice(0, 4)) : 0
  const lastYear = lastAllowed ? Number(lastAllowed.slice(0, 4)) : Infinity
  const monthAllowed = (m: string) => (!firstAllowed || m >= firstAllowed) && (!lastAllowed || m <= lastAllowed)
  const openChooser = (first: string) => {
    setChooseYear(Number(first.slice(0, 4)))
    setChoosing(true)
  }
  const chooseMonth = (m: string) => {
    // Show the chosen month first, unless it's the last bookable one.
    setView(lastAllowed && m >= lastAllowed && m > firstAllowed ? addMonths(m, -1) : m)
    setChoosing(false)
  }

  return (
    <div className="bk-field bk-wide bk-dates-field" ref={wrap}>
      <span className="bk-label" id="bk-dates-label">{bookPage.datesLabel}</span>
      <button
        type="button"
        className={`bk-dates-trigger${open ? ' is-open' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby="bk-dates-label bk-dates-value"
        onClick={toggle}
      >
        <Icon name="calendar" size={20} />
        <span className="bk-dates-value" id="bk-dates-value">
          <span className={arrive ? '' : 'is-empty'}>
            <small>Arrive</small>
            {arrive ? formatDay(arrive) : bookPage.datesPlaceholder}
          </span>
          <span className="bk-dates-sep" aria-hidden="true">&rarr;</span>
          <span className={depart ? '' : 'is-empty'}>
            <small>Depart</small>
            {depart ? formatDay(depart) : bookPage.datesPlaceholder}
          </span>
        </span>
      </button>

      {open && view && (
        <div className="bk-cal" role="dialog" aria-label={bookPage.datesLabel}>
          <p className="bk-cal-hint" aria-live="polite">{pickingDepart ? bookPage.pickDepart : bookPage.pickArrive}</p>
          {choosing ? (
            <div className="bk-cal-chooser">
              <div className="bk-cal-year">
                <button type="button" aria-label="Previous year" disabled={chooseYear <= firstYear} onClick={() => setChooseYear(chooseYear - 1)}>
                  &lsaquo;
                </button>
                <h3 aria-live="polite">{chooseYear}</h3>
                <button type="button" aria-label="Next year" disabled={chooseYear >= lastYear} onClick={() => setChooseYear(chooseYear + 1)}>
                  &rsaquo;
                </button>
              </div>
              <div className="bk-cal-month-grid">
                {MONTHS.map((name, m) => {
                  const iso = monthIso(chooseYear, m)
                  return (
                    <button
                      key={name}
                      type="button"
                      className={`bk-cal-mo${iso === view ? ' is-current' : ''}`}
                      disabled={!monthAllowed(iso)}
                      aria-pressed={iso === view}
                      onClick={() => chooseMonth(iso)}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <>
            <div className="bk-cal-nav">
              <button type="button" aria-label="Previous month" disabled={view <= firstAllowed} onClick={() => setView(addMonths(view, -1))}>
                &lsaquo;
              </button>
              <button type="button" aria-label="Next month" disabled={!!lastAllowed && addMonths(view, 1) >= lastAllowed} onClick={() => setView(addMonths(view, 1))}>
                &rsaquo;
              </button>
            </div>
            <div className="bk-cal-months">
              {months.map((first, i) => (
                <div key={first} className={`bk-cal-month${i ? ' is-second' : ''}`}>
                  <h3>
                    <button type="button" className="bk-cal-title" aria-label={`${monthTitle(first)}: choose another month`} onClick={() => openChooser(first)}>
                      {monthTitle(first)} <span aria-hidden="true">&#9662;</span>
                    </button>
                  </h3>
                  <div className="bk-cal-grid" role="grid">
                    {WEEKDAYS.map((w, k) => (
                      <span key={k} className="bk-cal-wd" aria-hidden="true">{w}</span>
                    ))}
                    {monthDays(first).map((d, k) => {
                      if (!d) return <span key={k} />
                      const isStart = d === arrive
                      const isEnd = d === depart
                      const between = !!arrive && !!depart && d > arrive && d < depart
                      const cls = ['bk-cal-day', isStart && 'is-start', isEnd && 'is-end', between && 'is-between', d === today && 'is-today']
                        .filter(Boolean)
                        .join(' ')
                      return (
                        <button
                          key={d}
                          type="button"
                          className={cls}
                          disabled={!enabled(d)}
                          aria-pressed={isStart || isEnd}
                          aria-label={longDay(d)}
                          onClick={() => pick(d)}
                        >
                          {Number(d.slice(8))}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
          <div className="bk-cal-foot">
            <button type="button" className="bk-cal-clear" disabled={!arrive} onClick={() => onChange('', '')}>
              {bookPage.clearDates}
            </button>
            <button type="button" className="bk-cal-done" onClick={() => setOpen(false)}>
              {bookPage.doneDates}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateRangePicker
