import { useState, type FormEvent } from 'react'
import { site } from '../content/site'

// Messages are sent through Formspree. Create a free form at formspree.io and
// set VITE_FORMSPREE_ID in .env.local (and in Vercel's environment variables).
const formId = import.meta.env.VITE_FORMSPREE_ID

const Contact = () => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch(`https://formspree.io/f/${formId}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(e.currentTarget),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="section light">
      <div className="container narrow">
        <h2>Contact us</h2>
        <p className="lead">Questions about dates, rigs or add-ons? We usually reply within a day.</p>
        {(site.contactEmail || site.contactPhone) && (
          <p>
            {site.contactEmail && <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>}
            {site.contactEmail && site.contactPhone && ' · '}
            {site.contactPhone && <a href={`tel:${site.contactPhone}`}>{site.contactPhone}</a>}
          </p>
        )}
        {formId ? (
          status === 'sent' ? (
            <p className="form-note">Thanks! We'll be in touch soon.</p>
          ) : (
            <form className="contact-form" onSubmit={onSubmit}>
              <label>
                Name
                <input name="name" required autoComplete="name" />
              </label>
              <label>
                Email
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <label>
                Dates you're thinking of
                <input name="dates" placeholder="e.g. June 12 to 14" />
              </label>
              <label>
                Message
                <textarea name="message" rows={5} required />
              </label>
              <input type="text" name="_gotcha" className="honeypot" tabIndex={-1} autoComplete="off" />
              <button type="submit" className="hero-btn primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </button>
              {status === 'error' && <p className="form-note">Something went wrong. Please try again.</p>}
            </form>
          )
        ) : (
          <p>
            <a className="hero-btn primary" href={site.hipcampUrl} target="_blank" rel="noopener">
              Message us on Hipcamp
            </a>
          </p>
        )}
      </div>
    </section>
  )
}

export default Contact
