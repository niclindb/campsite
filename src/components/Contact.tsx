import { contact, site } from '../content/site'
import contactImage from '../assets/images/contact.webp'
import Icon, { type IconName } from './Icon'
import ArrowIcon from './ArrowIcon'
import ContactForm from './contact/ContactForm'

// Messages are sent through Formspree, to the form in site.formspreeId.
// VITE_FORMSPREE_ID (e.g. in .env.local) overrides it for testing.
const formId = import.meta.env.VITE_FORMSPREE_ID || site.formspreeId

type Method = { icon: IconName; label: string; value: string; href: string; placeholder?: string; external?: boolean }

const methods: Method[] = [
  { icon: 'mail', label: 'Email', value: site.contactEmail, href: `mailto:${site.contactEmail}`, placeholder: contact.emailPlaceholder },
  { icon: 'phone', label: 'Call or text', value: site.contactPhone, href: `tel:${site.contactPhone.replace(/[^\d+]/g, '')}`, placeholder: contact.phonePlaceholder },
  { icon: 'chat', label: 'Hipcamp', value: contact.hipcampLabel, href: site.hipcampUrl, external: true },
]

const Contact = () => {
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
                    m.external ? (
                      <a className="arrow-link" href={m.href} target="_blank" rel="noopener">{m.value} <ArrowIcon /></a>
                    ) : (
                      <a className="arrow-link" href={m.href}>{m.value}</a>
                    )
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
          ) : (
            <ContactForm formId={formId} />
          )}
        </div>
      </div>
    </section>
  )
}

export default Contact
