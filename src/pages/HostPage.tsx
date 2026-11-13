import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Head } from 'vite-react-ssg'
import { addDays, formatDay, nightsBetween, pickedLabel } from '../content/booking'
import { site } from '../content/site'
import '../host.css'

// The hosts' private dashboard (/host): bookings, how full each night is,
// and page views. Not linked from the site. Sign-in uses HOST_PASSWORD
// (a Vercel setting); data comes from api/host-data.ts.

type Booking = {
  id: string
  status: 'held' | 'confirmed' | 'cancelled' | 'expired'
  arrive: string
  depart: string
  sites: number
  guests: number
  hookups: number
  extras: { name: string; price: number; qty?: number }[]
  total_cents: number
  tax_cents: number
  refunded_cents: number
  name: string
  email: string
  phone: string | null
  note: string | null
  created_at: string
  paid_at: string | null
  hold_expires_at: string | null
}

type Data = {
  today: string
  month: string
  siteCount: number
  limits: Record<string, number>
  bookings: Booking[]
  nights: { night: string; sitesUsed: number; hookupsUsed: number }[]
  items: { night: string; item: string; used: number }[]
  blocked: { night: string; sites: number; note: string | null }[]
  views: {
    from: string
    days: number
    rows: { day: string; path: string; views: number; visits: number }[]
    sources: { source: string; visits: number }[]
  }
}

const pageNames: Record<string, string> = {
  '/': 'Home',
  '/book': 'Book',
  '/book/confirmed': 'Booking confirmed',
  '/info': 'Guest info',
  '/privacy': 'Privacy',
  '/terms': 'Terms',
  'not found': 'Page not found',
}

const money = (cents: number) =>
  `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
const monthLabel = (month: string) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const shiftMonth = (month: string, by: number) => {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1 + by, 1)).toISOString().slice(0, 7)
}
const stamp = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: site.timeZone })
// Sends a change to one of the host API functions. Returns an error message, or null when it worked.
const hostPost = async (url: string, body: unknown) => {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) return null
    return ((await res.json().catch(() => ({}))) as { message?: string }).message || 'That didn’t work. Please try again.'
  } catch {
    return 'That didn’t work. Check your connection and try again.'
  }
}
const toCents = (dollars: string) => {
  const n = Number(dollars.replace(/[$,\s]/g, ''))
  return Number.isFinite(n) ? Math.round(n * 100) : NaN
}

const staysOn = (b: Booking, night: string) => b.status !== 'cancelled' && b.arrive <= night && b.depart > night

const HostPage = () => {
  const [state, setState] = useState<'loading' | 'signedOut' | 'ready' | 'error'>('loading')
  const [data, setData] = useState<Data | null>(null)
  const [month, setMonth] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [error, setError] = useState('')

  const load = useCallback(async (m: string | null, d: number) => {
    try {
      const res = await fetch(`/api/host-data?days=${d}${m ? `&month=${m}` : ''}`, { cache: 'no-store' })
      if (res.status === 401) return setState('signedOut')
      if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { message?: string }).message || 'Could not load')
      setData((await res.json()) as Data)
      setState('ready')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load')
      setState((s) => (s === 'ready' ? s : 'error'))
    }
  }, [])

  useEffect(() => {
    load(month, days)
  }, [load, month, days])

  const signOut = async () => {
    await fetch('/api/host-login', { method: 'DELETE' }).catch(() => {})
    setData(null)
    setState('signedOut')
  }

  return (
    <div className="host">
      <Head>
        <title>{`Host dashboard | ${site.name}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <header className="host-top">
        <div className="host-wrap host-top-row">
          <div>
            <p className="host-eyebrow">{site.name}</p>
            <h1>Host dashboard</h1>
          </div>
          {state === 'ready' && (
            <div className="host-top-actions">
              <button type="button" className="host-btn ghost" onClick={() => load(month, days)}>Refresh</button>
              <button type="button" className="host-btn ghost" onClick={signOut}>Sign out</button>
            </div>
          )}
        </div>
      </header>
      <main className="host-wrap host-main">
        {state === 'loading' && <p className="host-muted">Loading…</p>}
        {state === 'signedOut' && <SignIn onDone={() => load(month, days)} />}
        {state === 'error' && (
          <div className="host-card">
            <p>The dashboard couldn’t load: {error}</p>
            <button type="button" className="host-btn" onClick={() => load(month, days)}>Try again</button>
          </div>
        )}
        {state === 'ready' && data && (
          <Dashboard data={data} days={days} setDays={setDays} setMonth={setMonth} reload={() => load(month, days)} />
        )}
      </main>
    </div>
  )
}

const SignIn = ({ onDone }: { onDone: () => void }) => {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const res = await fetch('/api/host-login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) return onDone()
      const body = (await res.json().catch(() => ({}))) as { message?: string }
      setMessage(body.message || 'Sign-in failed. Please try again.')
    } catch {
      setMessage('Sign-in failed. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="host-card host-signin" onSubmit={submit}>
      <h2>Sign in</h2>
      <label className="host-label" htmlFor="host-password">Password</label>
      <input
        id="host-password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoFocus
      />
      {message && <p className="host-error" role="alert">{message}</p>}
      <button type="submit" className="host-btn" disabled={busy || !password}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  )
}

const Dashboard = ({
  data,
  days,
  setDays,
  setMonth,
  reload,
}: {
  data: Data
  days: number
  setDays: (d: number) => void
  setMonth: (m: string) => void
  reload: () => Promise<void>
}) => {
  const { today, bookings } = data
  const live = bookings.filter((b) => b.status !== 'cancelled')
  const upcoming = live.filter((b) => b.depart >= today)
  const nextArrival = upcoming.find((b) => b.arrive >= today)
  const staying = live.filter((b) => staysOn(b, today))
  const monthNights = data.nights.length
  const siteNights = data.nights.reduce((sum, n) => sum + Math.min(n.sitesUsed, data.siteCount), 0)
  const totalViews = data.views.rows.reduce((sum, r) => sum + r.views, 0)
  const totalVisits = data.views.rows.reduce((sum, r) => sum + r.visits, 0)

  return (
    <>
      <section className="host-tiles" aria-label="At a glance">
        <Tile label="Tonight" value={`${staying.reduce((s, b) => s + b.sites, 0)} of ${data.siteCount}`} detail="sites taken" />
        <Tile
          label="Next arrival"
          value={nextArrival ? formatDay(nextArrival.arrive) : 'None'}
          detail={nextArrival ? `${nextArrival.name}, ${plural(nextArrival.sites, 'site')}` : 'No upcoming bookings'}
        />
        <Tile label="Upcoming bookings" value={String(upcoming.length)} detail={money(upcoming.reduce((s, b) => s + (b.status === 'confirmed' ? b.total_cents : 0), 0)) + ' paid'} />
        <Tile
          label={monthLabel(data.month).split(' ')[0]}
          value={`${monthNights ? Math.round((siteNights / (monthNights * data.siteCount)) * 100) : 0}%`}
          detail={`${plural(siteNights, 'site-night')} booked`}
        />
        <Tile label={`Views, last ${days} days`} value={totalViews.toLocaleString('en-US')} detail={plural(totalVisits, 'visit')} />
      </section>

      <Calendar data={data} setMonth={setMonth} reload={reload} />
      <Bookings bookings={bookings} today={today} reload={reload} />
      <Views data={data} days={days} setDays={setDays} />
    </>
  )
}

const Tile = ({ label, value, detail }: { label: string; value: string; detail: string }) => (
  <div className="host-tile">
    <span className="host-label">{label}</span>
    <strong>{value}</strong>
    <span className="host-muted">{detail}</span>
  </div>
)

const Calendar = ({ data, setMonth, reload }: { data: Data; setMonth: (m: string) => void; reload: () => Promise<void> }) => {
  const { month, today, siteCount, limits } = data
  const [picked, setPicked] = useState<string | null>(null)
  useEffect(() => setPicked(null), [month])

  const first = `${month}-01`
  const lead = new Date(`${first}T00:00:00Z`).getUTCDay()
  const byNight = useMemo(() => new Map(data.nights.map((n) => [n.night, n])), [data.nights])
  const itemsOn = (night: string) => data.items.filter((i) => i.night === night && i.item !== 'Electric hookup')
  const blockedOn = (night: string) => data.blocked.find((b) => b.night === night)
  const hookupLimit = limits['Electric hookup'] ?? site.hookupsPerNight
  const selected = picked ?? (today.startsWith(month) ? today : null)

  return (
    <section className="host-card" aria-labelledby="host-cal-title">
      <div className="host-section-head">
        <h2 id="host-cal-title">Nights taken</h2>
        <div className="host-month-nav">
          <button type="button" className="host-btn ghost small" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month">‹</button>
          <span>{monthLabel(month)}</span>
          <button type="button" className="host-btn ghost small" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month">›</button>
        </div>
      </div>
      <p className="host-muted host-note">Sites booked out of {siteCount} each night, counting paid bookings, guests paying right now and nights you blocked. A dot means rental gear or a hookup is out. Tap a night for details or to block it.</p>
      <div className="host-cal">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <span key={d} className="host-cal-dow" aria-hidden="true">{d}</span>
        ))}
        {Array.from({ length: lead }, (_, i) => <span key={`x${i}`} />)}
        {data.nights.map((n) => {
          const used = Math.min(n.sitesUsed, siteCount)
          const gear = itemsOn(n.night).length > 0 || n.hookupsUsed > 0
          const cls = ['host-day', used >= siteCount ? 'full' : used > 0 ? 'some' : '', n.night === today ? 'today' : '', n.night === selected ? 'picked' : '', n.night < today ? 'past' : '']
          return (
            <button
              type="button"
              key={n.night}
              className={cls.filter(Boolean).join(' ')}
              onClick={() => setPicked(n.night)}
              aria-pressed={n.night === selected}
              aria-label={`${formatDay(n.night)}: ${used} of ${siteCount} sites taken${gear ? ', gear out' : ''}${blockedOn(n.night) ? ', blocked' : ''}`}
            >
              <span className="host-day-num">{Number(n.night.slice(8))}</span>
              <span className="host-day-sites">{n.sitesUsed}/{siteCount}</span>
              <span className="host-day-bar" aria-hidden="true"><span style={{ width: `${(used / siteCount) * 100}%` }} /></span>
              {gear && <span className="host-day-dot" aria-hidden="true" />}
              {blockedOn(n.night) && <span className="host-day-block" aria-hidden="true">Blocked</span>}
            </button>
          )
        })}
      </div>

      {selected && byNight.get(selected) && (
        <NightDetail
          night={selected}
          usage={byNight.get(selected)!}
          siteCount={siteCount}
          hookupLimit={hookupLimit}
          items={itemsOn(selected)}
          limits={limits}
          blocked={blockedOn(selected)}
          bookings={data.bookings}
        />
      )}
      {selected && <BlockForm key={selected} night={selected} siteCount={siteCount} blocked={blockedOn(selected)} reload={reload} />}
    </section>
  )
}

const NightDetail = ({
  night,
  usage,
  siteCount,
  hookupLimit,
  items,
  limits,
  blocked,
  bookings,
}: {
  night: string
  usage: Data['nights'][number]
  siteCount: number
  hookupLimit: number
  items: Data['items']
  limits: Record<string, number>
  blocked?: Data['blocked'][number]
  bookings: Booking[]
}) => {
  const here = bookings.filter((b) => staysOn(b, night))
  const leaving = bookings.filter((b) => b.status !== 'cancelled' && b.depart === night)
  return (
    <div className="host-night">
      <h3>Night of {formatDay(night)}</h3>
      <dl className="host-facts">
        <div><dt>Sites</dt><dd>{usage.sitesUsed} of {siteCount}</dd></div>
        <div><dt>Hookups</dt><dd>{usage.hookupsUsed} of {hookupLimit}</dd></div>
        {items.map((i) => (
          <div key={i.item}><dt>{i.item}</dt><dd>{i.used}{limits[i.item] ? ` of ${limits[i.item]}` : ''}</dd></div>
        ))}
      </dl>
      {blocked && <p className="host-muted">You blocked {plural(blocked.sites, 'site')} this night{blocked.note ? `: ${blocked.note}` : ''}.</p>}
      {here.length ? (
        <ul className="host-mini-list">
          {here.map((b) => (
            <li key={b.id}>
              <strong>{b.name}</strong> {plural(b.sites, 'site')}, {plural(b.guests, 'guest')}
              {b.arrive === night && <span className="host-pill arrive">Arrives</span>}
              {b.status === 'held' && <span className="host-pill held">Paying now</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="host-muted">Nobody booked this night.</p>
      )}
      {leaving.length > 0 && <p className="host-muted">Checking out this morning: {leaving.map((b) => b.name).join(', ')}</p>}
    </div>
  )
}

// Block or unblock sites on one night or a run of nights.
const BlockForm = ({
  night,
  siteCount,
  blocked,
  reload,
}: {
  night: string
  siteCount: number
  blocked?: Data['blocked'][number]
  reload: () => Promise<void>
}) => {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState(night)
  const [through, setThrough] = useState(night)
  const [sites, setSites] = useState(blocked?.sites ?? siteCount)
  const [note, setNote] = useState(blocked?.note ?? '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const send = async (action: 'block' | 'unblock', range = { from, through }) => {
    if (range.through < range.from) return setMessage('The last night must be on or after the first night.')
    setBusy(true)
    setMessage('')
    const error = await hostPost('/api/host-block', { action, ...range, sites, note })
    setBusy(false)
    if (error) return setMessage(error)
    setOpen(false)
    await reload()
  }

  if (!open) {
    return (
      <div className="host-actions">
        <button type="button" className="host-btn ghost" onClick={() => setOpen(true)}>{blocked ? 'Change block' : 'Block nights'}</button>
        {blocked && (
          <button type="button" className="host-btn ghost" disabled={busy} onClick={() => send('unblock', { from: night, through: night })}>
            {busy ? 'Unblocking…' : 'Unblock this night'}
          </button>
        )}
        {message && <p className="host-error" role="alert">{message}</p>}
      </div>
    )
  }

  const count = Math.max(0, nightsBetween(from, through) + 1)
  return (
    <form className="host-panel" onSubmit={(e) => { e.preventDefault(); send('block') }}>
      <h3>Block nights</h3>
      <p className="host-muted host-panel-note">Blocked sites count as taken, so guests can’t book them. Use it for Hipcamp bookings, family visits or closures. It doesn’t affect anyone already booked.</p>
      <div className="host-fields">
        <label>
          <span className="host-label">First night</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} required />
        </label>
        <label>
          <span className="host-label">Last night</span>
          <input type="date" value={through} min={from} onChange={(e) => setThrough(e.target.value)} required />
        </label>
        <label>
          <span className="host-label">Sites to block</span>
          <select value={sites} onChange={(e) => setSites(Number(e.target.value))}>
            {Array.from({ length: siteCount }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n === siteCount ? `All ${n}` : n}</option>
            ))}
          </select>
        </label>
        <label className="host-wide">
          <span className="host-label">Note (only you see it)</span>
          <input type="text" value={note} maxLength={200} placeholder="e.g. Hipcamp booking, family weekend" onChange={(e) => setNote(e.target.value)} />
        </label>
      </div>
      {message && <p className="host-error" role="alert">{message}</p>}
      <div className="host-actions">
        <button type="submit" className="host-btn" disabled={busy || count < 1}>
          {busy ? 'Saving…' : `Block ${sites === siteCount ? 'all sites' : plural(sites, 'site')}, ${plural(count, 'night')}`}
        </button>
        <button type="button" className="host-btn ghost" disabled={busy || count < 1} onClick={() => send('unblock')}>Unblock these nights</button>
        <button type="button" className="host-btn ghost" onClick={() => setOpen(false)}>Close</button>
      </div>
    </form>
  )
}

const statusLabel: Record<Booking['status'], string> = {
  confirmed: 'Paid',
  held: 'Paying now',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

const Bookings = ({ bookings, today, reload }: { bookings: Booking[]; today: string; reload: () => Promise<void> }) => {
  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const lists = {
    upcoming: bookings.filter((b) => b.status !== 'cancelled' && b.depart >= today),
    past: bookings.filter((b) => b.status !== 'cancelled' && b.depart < today).reverse(),
    cancelled: bookings.filter((b) => b.status === 'cancelled').reverse(),
  }
  const shown = lists[tab]
  return (
    <section className="host-card" aria-labelledby="host-bookings-title">
      <div className="host-section-head">
        <h2 id="host-bookings-title">Bookings</h2>
        <div className="host-tabs" role="tablist">
          {(['upcoming', 'past', 'cancelled'] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)} <span>{lists[t].length}</span>
            </button>
          ))}
        </div>
      </div>
      {shown.length === 0 ? (
        <p className="host-muted">No {tab} bookings booked on the website yet. Hipcamp bookings aren’t listed here.</p>
      ) : (
        <ul className="host-bookings">
          {shown.map((b) => <BookingCard key={b.id} b={b} reload={reload} />)}
        </ul>
      )}
    </section>
  )
}

const BookingCard = ({ b, reload }: { b: Booking; reload: () => Promise<void> }) => {
  const nights = nightsBetween(b.arrive, b.depart)
  return (
    <li className="host-booking">
      <div className="host-booking-head">
        <strong>{b.name}</strong>
        <span className={`host-pill ${b.status}`}>{statusLabel[b.status]}</span>
      </div>
      <p className="host-booking-dates">
        {formatDay(b.arrive)} to {formatDay(b.depart)} <span className="host-muted">({plural(nights, 'night')})</span>
      </p>
      <dl className="host-facts">
        <div><dt>Sites</dt><dd>{b.sites}</dd></div>
        <div><dt>Guests</dt><dd>{b.guests}</dd></div>
        <div><dt>Total</dt><dd>{money(b.total_cents)}</dd></div>
        <div><dt>Tax</dt><dd>{money(b.tax_cents)}</dd></div>
        {b.refunded_cents > 0 && <div><dt>Refunded</dt><dd>{money(b.refunded_cents)}</dd></div>}
      </dl>
      <p className="host-booking-extras">
        <span className="host-label">Add-ons</span>{' '}
        {b.extras.length ? b.extras.map((x) => `${pickedLabel(x.name, x.qty ?? 1)} ($${x.price * (x.qty ?? 1)})`).join(', ') : 'None'}
      </p>
      {b.note && <p className="host-booking-note">“{b.note}”</p>}
      <p className="host-booking-contact">
        <a href={`mailto:${b.email}`}>{b.email}</a>
        {b.phone && <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a>}
      </p>
      <p className="host-muted host-booking-meta">
        Booked {stamp(b.created_at)}
        {b.paid_at && `, paid ${stamp(b.paid_at)}`}
      </p>
      {b.status === 'confirmed' && b.total_cents - b.refunded_cents > 0 && <RefundPanel b={b} reload={reload} />}
    </li>
  )
}

const Views = ({ data, days, setDays }: { data: Data; days: number; setDays: (d: number) => void }) => {
  const { rows, sources, from } = data.views
  const daily = useMemo(() => {
    const totals = new Map<string, { views: number; visits: number }>()
    for (let d = from; d <= data.today; d = addDays(d, 1)) totals.set(d, { views: 0, visits: 0 })
    for (const r of rows) {
      const t = totals.get(r.day)
      if (t) {
        t.views += r.views
        t.visits += r.visits
      }
    }
    return [...totals.entries()].map(([day, t]) => ({ day, ...t }))
  }, [rows, from, data.today])
  const pages = useMemo(() => {
    const totals = new Map<string, { views: number; visits: number }>()
    for (const r of rows) {
      const t = totals.get(r.path) ?? { views: 0, visits: 0 }
      t.views += r.views
      t.visits += r.visits
      totals.set(r.path, t)
    }
    return [...totals.entries()].sort((a, b) => b[1].views - a[1].views)
  }, [rows])
  const peak = Math.max(1, ...daily.map((d) => d.views))
  const [hover, setHover] = useState<number | null>(null)
  const shown = hover == null ? null : daily[hover]

  return (
    <section className="host-card" aria-labelledby="host-views-title">
      <div className="host-section-head">
        <h2 id="host-views-title">Page views</h2>
        <div className="host-tabs" role="group" aria-label="Period">
          {[7, 30, 90].map((d) => (
            <button key={d} type="button" aria-pressed={days === d} className={days === d ? 'on' : ''} onClick={() => setDays(d)}>{d} days</button>
          ))}
        </div>
      </div>
      <p className="host-muted host-note">Counted on the live site without cookies, and nothing about visitors is stored. A visit is someone arriving from outside the site; views are every page they open. Your own visits while signed in aren’t counted.</p>

      <div className="host-chart-wrap">
        <p className="host-chart-readout" aria-live="polite">
          {shown ? `${formatDay(shown.day)}: ${plural(shown.views, 'view')}, ${plural(shown.visits, 'visit')}` : `Daily views. Busiest day: ${peak === 1 && !daily.some((d) => d.views) ? 'none yet' : plural(peak, 'view')}`}
        </p>
        <div className="host-chart" onMouseLeave={() => setHover(null)}>
          {daily.map((d, i) => (
            <button
              type="button"
              key={d.day}
              className={`host-bar${hover === i ? ' on' : ''}`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onClick={() => setHover(i)}
              aria-label={`${formatDay(d.day)}: ${plural(d.views, 'view')}`}
            >
              <span style={{ height: `${(d.views / peak) * 100}%` }} />
            </button>
          ))}
        </div>
        <div className="host-chart-axis host-muted" aria-hidden="true">
          <span>{formatDay(from)}</span>
          <span>Today</span>
        </div>
      </div>

      <div className="host-views-tables">
        <table className="host-table">
          <caption>By page</caption>
          <thead><tr><th scope="col">Page</th><th scope="col">Views</th><th scope="col">Visits</th></tr></thead>
          <tbody>
            {pages.length ? pages.map(([path, t]) => (
              <tr key={path}><th scope="row">{pageNames[path] ?? path}</th><td>{t.views}</td><td>{t.visits}</td></tr>
            )) : <tr><td colSpan={3} className="host-muted">No views counted yet.</td></tr>}
          </tbody>
        </table>
        <table className="host-table">
          <caption>Where visits came from</caption>
          <thead><tr><th scope="col">Source</th><th scope="col">Visits</th></tr></thead>
          <tbody>
            {sources.length ? sources.map((s) => (
              <tr key={s.source}><th scope="row">{s.source === 'direct' ? 'Direct or bookmark' : s.source}</th><td>{s.visits}</td></tr>
            )) : <tr><td colSpan={2} className="host-muted">No visits counted yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// Refund all of what's left, half the booking, or a set amount, through Stripe.
const RefundPanel = ({ b, reload }: { b: Booking; reload: () => Promise<void> }) => {
  const left = b.total_cents - b.refunded_cents
  const half = Math.min(Math.floor(b.total_cents / 2), left)
  const [open, setOpen] = useState(false)
  const [choice, setChoice] = useState<'full' | 'half' | 'amount'>('full')
  const [amount, setAmount] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  // One id per refund attempt, so pressing the button twice can't refund twice.
  const [requestId, setRequestId] = useState('')

  const cents = choice === 'full' ? left : choice === 'half' ? half : toCents(amount)
  const valid = Number.isInteger(cents) && cents >= 1 && cents <= left
  const reset = () => {
    setOpen(false)
    setConfirming(false)
    setMessage('')
    setAmount('')
    setChoice('full')
  }

  const refund = async () => {
    setBusy(true)
    setMessage('')
    const error = await hostPost('/api/host-refund', { bookingId: b.id, amountCents: cents, requestId })
    setBusy(false)
    if (error) {
      setConfirming(false)
      return setMessage(error)
    }
    reset()
    await reload()
  }

  if (!open) {
    return (
      <div className="host-actions">
        <button type="button" className="host-btn ghost" onClick={() => { setOpen(true); setRequestId(crypto.randomUUID()) }}>Refund</button>
      </div>
    )
  }

  return (
    <div className="host-panel">
      {!confirming ? (
        <>
          <fieldset className="host-choices">
            <legend className="host-label">Refund</legend>
            <label>
              <input type="radio" name={`refund-${b.id}`} checked={choice === 'full'} onChange={() => setChoice('full')} />
              <span>Full refund <strong>{money(left)}</strong><small>Cancels the booking and frees its nights</small></span>
            </label>
            {half > 0 && half < left && (
              <label>
                <input type="radio" name={`refund-${b.id}`} checked={choice === 'half'} onChange={() => setChoice('half')} />
                <span>Refund half <strong>{money(half)}</strong><small>Booking stays, nights stay taken</small></span>
              </label>
            )}
            <label>
              <input type="radio" name={`refund-${b.id}`} checked={choice === 'amount'} onChange={() => setChoice('amount')} />
              <span>Specific amount<small>Up to {money(left)}. Less than that keeps the booking.</small></span>
            </label>
            {choice === 'amount' && (
              <input
                className="host-amount"
                type="text"
                inputMode="decimal"
                placeholder="$0.00"
                aria-label="Amount to refund in dollars"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            )}
          </fieldset>
          {choice === 'amount' && amount && !valid && <p className="host-error">Enter an amount between $0.01 and {money(left)}.</p>}
          {message && <p className="host-error" role="alert">{message}</p>}
          <div className="host-actions">
            <button type="button" className="host-btn" disabled={!valid} onClick={() => setConfirming(true)}>
              {valid ? `Refund ${money(cents)}` : 'Refund'}
            </button>
            <button type="button" className="host-btn ghost" onClick={reset}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <p className="host-confirm">
            Refund <strong>{money(cents)}</strong> to {b.name}’s card?{' '}
            {cents >= left ? 'This cancels the booking and frees its nights.' : 'The booking stays in place.'} This can’t be undone.
          </p>
          <div className="host-actions">
            <button type="button" className="host-btn" disabled={busy} onClick={refund}>{busy ? 'Refunding…' : `Yes, refund ${money(cents)}`}</button>
            <button type="button" className="host-btn ghost" disabled={busy} onClick={() => setConfirming(false)}>Back</button>
          </div>
        </>
      )}
    </div>
  )
}

export default HostPage
