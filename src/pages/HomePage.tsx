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
      description="Quiet forest RV and tent sites 7 miles from Marquette in Michigan's Upper Peninsula. $28 per site per night, pets welcome, open year round."
    />
    <Hero />
    <About />
    <Reviews />
    <Sites />
    <Gallery />
    <Location />
    <Contact />
  </>
)

export default HomePage
