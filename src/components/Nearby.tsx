import { nearby } from '../content/site'

const Nearby = () => {
  return (
    <section id="nearby" className="section light">
      <div className="container">
        <h2>Things to do nearby</h2>
        <ul className="card-grid">
          {nearby.map((n) => (
            <li key={n.name} className="card">
              <h3>{n.name}</h3>
              <p>{n.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Nearby
