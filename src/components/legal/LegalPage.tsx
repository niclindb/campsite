import { Link } from 'react-router-dom'
import PageHeader from '../PageHeader'
import ArrowIcon from '../ArrowIcon'
import { legal, type LegalSection } from '../../content/legal'

type Props = { title: string; intro: string; lead: string; sections: LegalSection[] }

// A policy page: a short header, a list of sections to jump to, then each section.
const LegalPage = ({ title, intro, lead, sections }: Props) => (
  <>
    <PageHeader title={title} intro={intro} />
    <div className="container legal">
      <aside className="legal-toc" aria-label="On this page">
        <p className="legal-updated">Last updated {legal.updatedLabel}</p>
        <ol>
          {sections.map((s) => (
            <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>
          ))}
        </ol>
      </aside>
      <article className="legal-body">
        <p className="legal-lead">{lead}</p>
        {sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`}>
            <h2 id={`${s.id}-title`}>{s.title}</h2>
            {s.proposed && <p className="legal-flag"><span className="contact-placeholder">{s.proposed}</span></p>}
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
        ))}
      </article>
    </div>
  </>
)

export default LegalPage
