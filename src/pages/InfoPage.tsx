import PageMeta from '../components/PageMeta'
import PageHeader from '../components/PageHeader'
import Info from '../components/Info'

const InfoPage = () => (
  <>
    <PageMeta
      title="Guest info & FAQ"
      path="/info"
      description="Check-in times, water, toilets, pets, campfires and rig sizes at Northern Oasis Camping near Marquette, Michigan."
    />
    <PageHeader title="Guest info & FAQ" intro="Everything to know before you arrive." />
    <Info />
  </>
)

export default InfoPage
