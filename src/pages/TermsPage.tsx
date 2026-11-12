import PageMeta from '../components/PageMeta'
import LegalPage from '../components/legal/LegalPage'
import { termsPage } from '../content/legal'
import { site } from '../content/site'
import bannerImage from '../assets/gallery/17-tall-maples.webp'

const TermsPage = () => (
  <>
    <PageMeta
      title={termsPage.title}
      path="/terms"
      description={`Booking, payment, cancellation and camp rules at ${site.name}, plus the liability acknowledgement every guest agrees to.`}
    />
    <LegalPage {...termsPage} image={bannerImage} />
  </>
)

export default TermsPage
