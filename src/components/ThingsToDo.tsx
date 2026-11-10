import { thingsToDo } from '../content/site'
import Icon from './Icon'

type Props = {
  // The /explore page has its own page header, so it hides this one.
  showHeading?: boolean
}

// "Things to do": a dashed trail from camp out to each place, in list order,
// with the icons sitting on the line. Desktop runs it across the page; on a
// phone it turns to run down the left side, one short row per stop.
const ThingsToDo = ({ showHeading = true }: Props) => {
  const stops = [...thingsToDo.nextDoor, ...thingsToDo.dayTrips]
  return (
    <section
      id="things-to-do"
      className="section things-to-do"
      aria-labelledby={showHeading ? 'ttd-title' : undefined}
      aria-label={showHeading ? undefined : thingsToDo.heading}
    >
      <div className="container">
        {showHeading && (
          <>
            <p className="about-eyebrow">Explore the area</p>
            <h2 id="ttd-title">{thingsToDo.heading}</h2>
            <p className="lead">{thingsToDo.intro}</p>
          </>
        )}
        <ol className="ttd-trail">
          <li className="ttd-start">
            <span className="ttd-dot camp"><Icon name="tent" /></span>
            <span className="ttd-text"><strong className="ttd-name">Camp</strong></span>
          </li>
          {stops.map((s) => (
            <li key={s.name}>
              <span className="ttd-dot"><Icon name={s.icon} /></span>
              <span className="ttd-text">
                <span className="ttd-miles">{s.distance}</span>
                <strong className="ttd-name">{s.name}</strong>
                <span className="ttd-detail">{s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="ttd-dogs"><Icon name="paw" /> {thingsToDo.dogs}</p>
      </div>
    </section>
  )
}

export default ThingsToDo
