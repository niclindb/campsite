import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ArrowIcon from '../ArrowIcon'
import Icon from '../Icon'
import {
  legal,
  shortVersionNote,
  shortVersionTitle,
  tocTitle,
  type LegalHighlight,
  type LegalSection,
  type RefundStep,
} from '../../content/legal'

type Props = {
  title: string
  intro: string
  lead: string
  eyebrow: string
  summary: LegalHighlight[]
  sections: LegalSection[]
  image: string
}

// Which section you're reading, so the table of contents can highlight it:
// the last one whose heading has passed the top fifth of the screen.
const useActiveSection = (ids: string[]) => {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const update = () => {
      const line = window.innerHeight * 0.2 + 80
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActive(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ids])
  return active
}

const RefundTimeline = ({ steps }: { steps: RefundStep[] }) => (
  <ol className="legal-refund" aria-label="Refunds at a glance">
    {steps.map((s) => (
      <li key={s.tone} className={`legal-refund-${s.tone}`}>
        <span className="legal-refund-amount">{s.refund}</span>
        <span className="legal-refund-when">{s.when}</span>
      </li>
    ))}
  </ol>
)

const Section = ({ s, n }: { s: LegalSection; n: number }) => (
  <section id={s.id} aria-labelledby={`${s.id}-title`} className="legal-section">
    <h2 id={`${s.id}-title`}>
      <span className="legal-num" aria-hidden="true">{String(n).padStart(2, '0')}</span>
      {s.title}
    </h2>
    {s.proposed && <p className="legal-flag"><span className="contact-placeholder">{s.proposed}</span></p>}
    {s.refundSteps && <RefundTimeline steps={s.refundSteps} />}
    {s.body.map((b, i) =>
      typeof b === 'string' ? (
        <p key={i}>{b}</p>
      ) : (
        <ul key={i}>{b.list.map((item) => <li key={item}>{item}</li>)}</ul>
      ),
    )}
    {s.pending && <p className="legal-flag"><span className="contact-placeholder">{s.pending}</span></p>}
    {s.link && <Link className="arrow-link" to={s.link.to}>{s.link.label} <ArrowIcon /></Link>}
  </section>
)

// A policy page: photo banner, "the short version" cards, a table of contents
// that follows you down the page, then the full wording section by section.
const LegalPage = ({ title, intro, lead, eyebrow, summary, sections, image }: Props) => {
  const ids = useMemo(() => sections.map((s) => s.id), [sections])
  const active = useActiveSection(ids)
  const tocRef = useRef<HTMLElement>(null)

  // On phones the contents are a row of chips: keep the current one in view.
  useEffect(() => {
    const toc = tocRef.current
    const link = toc?.querySelector<HTMLElement>('a.active')
    if (toc && link && toc.scrollWidth > toc.clientWidth) {
      toc.scrollTo({ left: link.offsetLeft - 16, behavior: 'smooth' })
    }
  }, [active])

  return (
    <div className="legal-page">
      <section className="legal-banner">
        <img src={image} alt="" />
        <div className="container">
          <p className="contact-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{intro}</p>
          <p className="legal-updated">Last updated {legal.updatedLabel}</p>
        </div>
      </section>

      <div className="container">
        <div className="legal-short">
          <div className="legal-short-head">
            <h2>{shortVersionTitle}</h2>
            <p>{shortVersionNote}</p>
          </div>
          <ul>
            {summary.map((h) => (
              <li key={h.label}>
                <span className="legal-short-icon"><Icon name={h.icon} size={20} /></span>
                <span className="legal-short-label">{h.label}</span>
                <strong>{h.value}</strong>
                <span className="legal-short-detail">{h.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container legal">
        <nav ref={tocRef} className="legal-toc" aria-label={tocTitle}>
          <p className="legal-toc-title">{tocTitle}</p>
          <ol>
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className={active === s.id ? 'active' : ''} aria-current={active === s.id ? 'location' : undefined}>
                  <span className="legal-toc-num" aria-hidden="true">{i + 1}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="legal-body">
          <p className="legal-lead">{lead}</p>
          {sections.map((s, i) => <Section key={s.id} s={s} n={i + 1} />)}
          <a className="legal-top" href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Back to top</a>
        </article>
      </div>
    </div>
  )
}

export default LegalPage
