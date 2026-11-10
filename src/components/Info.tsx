import { faq } from '../content/site'

const Info = () => {
  return (
    <section id="info" className="section">
      <div className="container narrow">
        <div className="faq">
          {faq.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Info
