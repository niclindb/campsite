import PageMeta from '../components/PageMeta'
import PageHeader from '../components/PageHeader'
import Nearby from '../components/Nearby'

const ExplorePage = () => (
  <>
    <PageMeta
      title="Things to do nearby"
      path="/explore"
      description="Fishing, paddling, mountain biking and trails near Northern Oasis Camping, plus Marquette, Lake Superior and Pictured Rocks."
    />
    <PageHeader
      title="Things to do nearby"
      intro="Lakes and trails right next door, with Marquette and Lake Superior a short drive away."
    />
    <Nearby />
  </>
)

export default ExplorePage
