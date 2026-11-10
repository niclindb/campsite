import { useState, type FormEvent } from 'react'
import { contact, site } from '../content/site'
import contactImage from '../assets/images/contact.webp'
import Icon, { type IconName } from './Icon'

// Messages are sent through Formspree. Create a free form at formspree.io and
// set VITE_FORMSPREE_ID in .env.local (and in Vercel's environment variables).
const formId = import.meta.env.VITE_FORMSPREE_ID

type Method = { icon: IconName; label: string; value: string; href: string; placeholder?: string; external?: boolean }

const methods: Method[] = [
  { icon: 'mail', label: 'Email', value: site.contactEmail, href: `mailto:${site.contactEmail}`, placeholder: contact.emailPlaceholder },
  { icon: 'phone', label: 'Call or text', value: site.contactPhone, href: `tel:${site.contactPhone}`, placeholder: contact.phonePlaceholder },
  { icon: 'chat', label: 'Hipcamp', value: contact.hipcampLabel, href: site.hipcampUrl, external: true },
]

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
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <img className="contact-bg" src={contactImage} alt="" loading="lazy" />
      <div className="container contact-grid">
        <div>
          <p className="contact-eyebrow">{contact.eyebrow}</p>
          <h2 id="contact-title">{contact.heading}</h2>
          <p className="contact-lead">{contact.lead}</p>
          <ul className="contact-card">
            {methods.map((m) => (
              <li key={m.label}>
                <span className="contact-card-icon"><Icon name={m.icon} size={20} /></span>
                <span>
                  <span className="contact-card-label">{m.label}</span>
                  {m.value ? (
                    <a href={m.href} {...(m.external ? { target: '_blank', rel: 'noopener' } : {})}>{m.value}</a>
                  ) : (
                    <span className="contact-placeholder">{m.placeholder}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p className="contact-sign">— {site.hosts}, your hosts</p>
        </div>

        <div className="contact-form-card">
          {!formId ? (
            <>
              <h3>{contact.formTitle}</h3>
              <p>{contact.noFormNote}</p>
              <a className="hero-btn primary" href={site.hipcampUrl} target="_blank" rel="noopener">
                {contact.hipcampLabel}
              </a>
            </>
          ) : status === 'sent' ? (
            <p className="form-note">Thanks! We'll be in touch soon.</p>
          ) : (
            <form className="contact-form" onSubmit={onSubmit}>
              <h3>{contact.formTitle}</h3>
              <div className="contact-form-row">
                <label>
                  Name
                  <input name="name" required autoComplete="name" />
                </label>
                <label>
                  Email
                  <input name="email" type="email" required autoComplete="email" />
                </label>
              </div>
              <label>
                <span>Dates you're thinking of <span className="contact-optional">(optional)</span></span>
                <input name="dates" placeholder="e.g. June 12 to 14" />
              </label>
              <label>
                Message
                <textarea name="message" rows={5} required placeholder="Your rig, how many campers, any add-ons…" />
              </label>
              <input type="text" name="_gotcha" className="honeypot" tabIndex={-1} autoComplete="off" />
              <button type="submit" className="hero-btn primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </button>
              {status === 'error' && <p className="form-note">Something went wrong. Please try again.</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export default Contact
