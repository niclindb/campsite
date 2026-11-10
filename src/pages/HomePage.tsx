import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import Hero from '../components/Hero'
import About from '../components/About'
import Sites from '../components/Sites'
import Gallery from '../components/Gallery'
import Reviews from '../components/Reviews'
import Location from '../components/Location'
import Contact from '../components/Contact'

const HomePage = () => (
  <>
    <PageMeta
      path="/"
      description="Quiet forest RV and tent sites 7 miles from Marquette in Michigan's Upper Peninsula. $28 per site per night, pets welcome, open April to November."
    />
    <Hero />
    <About />
    <Sites />
    <Gallery />
    <Reviews />
    <Location />
    <section className="section light page-links">
      <div className="container link-cards">
        <Link to="/info" className="link-card">
          <h3>Guest info & FAQ</h3>
          <p>Check-in times, water, toilets, pets, fires and more.</p>
        </Link>
      </div>
    </section>
    <Contact />
  </>
)

export default HomePage
