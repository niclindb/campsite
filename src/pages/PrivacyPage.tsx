import PageMeta from '../components/PageMeta'
import LegalPage from '../components/legal/LegalPage'
import { privacyPage } from '../content/legal'
import { site } from '../content/site'
import bannerImage from '../assets/gallery/16-fog.webp'

const PrivacyPage = () => (
  <>
    <PageMeta
      title={privacyPage.title}
      path="/privacy"
      description={`How ${site.name} collects, uses and protects the information you give us when you book or get in touch.`}
    />
    <LegalPage {...privacyPage} image={bannerImage} />
  </>
)

export default PrivacyPage
