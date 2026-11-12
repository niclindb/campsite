import { useState } from 'react'
import { contact, faqGroups, infoGlance, infoPage, site, type FaqItem } from '../content/site'
import bannerImage from '../assets/images/info.webp'
import bannerSrcSet from '../assets/images/info.webp?w=800;1600&format=webp&quality=72&as=srcset&imagetools'
import Icon from './Icon'
import ArrowIcon from './ArrowIcon'

// Answers and facts marked `pending` in site.ts show a dashed "to come" placeholder.
const Pending = ({ text }: { text: string }) => <span className="contact-placeholder">{text}</span>

// One topic's questions. Only one answer is open at a time.
const Accordion = ({ items }: { items: FaqItem[] }) => {
  const [open, setOpen] = useState<string | null>(items[0]?.q ?? null)
  return (
    <div className="info-acc">
      {items.map((f) => (
        <details
          key={f.q}
          open={open === f.q}
          onToggle={(e) => {
            if (e.currentTarget.open) setOpen(f.q)
            else if (open === f.q) setOpen(null)
          }}
        >
          <summary>
            <span>{f.q}</span>
            <span className="faq-toggle" aria-hidden="true" />
          </summary>
          <p>{f.pending ? <Pending text={f.a} /> : f.a}</p>
        </details>
      ))}
    </div>
  )
}

const Info = () => {
  const [tab, setTab] = useState(faqGroups[0].id)
  const group = faqGroups.find((g) => g.id === tab) ?? faqGroups[0]

  return (
    <>
      <section className="info-banner">
        <img src={bannerImage} srcSet={bannerSrcSet} sizes="100vw" alt="" />
        <div className="container">
          <p className="contact-eyebrow">{infoPage.eyebrow}</p>
          <h1>{infoPage.title}</h1>
          <p>{infoPage.intro}</p>
        </div>
      </section>

      <div className="container">
        <div className="info-glance">
          <h2>{infoPage.glanceTitle}</h2>
          <ul>
            {infoGlance.map((g) => (
              <li key={g.label}>
                <span className="about-highlight-icon"><Icon name={g.icon} size={20} /></span>
                <span>
                  <span className="glance-label">{g.label}</span>
                  {g.pending ? <Pending text={g.value} /> : <span className="glance-value">{g.value}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section id="info" className="info-faq" aria-label="Frequently asked questions">
        <div className="container info-grid">
          <div>
            <div className="info-tabs" role="tablist" aria-label="Topics">
              {faqGroups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  role="tab"
                  id={`tab-${g.id}`}
                  aria-selected={g.id === tab}
                  aria-controls="faq-panel"
                  className={g.id === tab ? 'active' : ''}
                  onClick={() => setTab(g.id)}
                >
                  <Icon name={g.icon} size={18} />
                  {g.title}
                </button>
              ))}
            </div>
            <div id="faq-panel" role="tabpanel" aria-labelledby={`tab-${group.id}`}>
              <Accordion key={group.id} items={group.items} />
            </div>
          </div>

          <aside className="info-ask">
            <h2>{infoPage.askTitle}</h2>
            <p>{infoPage.askText}</p>
            <ul className="ask-methods">
              <li>
                <Icon name="mail" size={18} />
                {site.contactEmail ? <a className="arrow-link" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> : <Pending text={contact.emailPlaceholder} />}
              </li>
              <li>
                <Icon name="phone" size={18} />
                {site.contactPhone ? <a className="arrow-link" href={`tel:${site.contactPhone.replace(/[^\d+]/g, '')}`}>{site.contactPhone}</a> : <Pending text={contact.phonePlaceholder} />}
              </li>
              <li>
                <Icon name="chat" size={18} />
                <a className="arrow-link" href={site.hipcampUrl} target="_blank" rel="noopener">{contact.hipcampLabel} <ArrowIcon /></a>
              </li>
            </ul>
            <p className="contact-sign">— {site.hosts}</p>
          </aside>
        </div>
      </section>
    </>
  )
}

export default Info
