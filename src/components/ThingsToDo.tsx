import { thingsToDo } from '../content/site'
import Icon from './Icon'

// "Things to do": a dashed trail from camp out to each place, in list order,
// with the icons sitting on the line. Desktop runs it across the page; on a
// phone it turns to run down the left side, one short row per stop.
export const Trail = () => (
  <ol className="ttd-trail">
    <li className="ttd-start">
      <span className="ttd-dot camp"><Icon name="tent" /></span>
      <span className="ttd-text"><strong className="ttd-name">Camp</strong></span>
    </li>
    {thingsToDo.map((s) => (
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
)
