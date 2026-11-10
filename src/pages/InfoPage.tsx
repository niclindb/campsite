import PageMeta from '../components/PageMeta'
import Info from '../components/Info'
import { infoPage } from '../content/site'

const InfoPage = () => (
  <>
    <PageMeta
      title={infoPage.title}
      path="/info"
      description="Check-in times, water, toilets, pets, campfires and rig sizes at Northern Oasis Camping near Marquette, Michigan."
    />
    <Info />
  </>
)

export default InfoPage
