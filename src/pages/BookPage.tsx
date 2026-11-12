import PageMeta from '../components/PageMeta'
import Book from '../components/Book'

const BookPage = () => (
  <>
    <PageMeta
      title="Book your stay"
      path="/book"
      description="Book a tent or RV site direct with the hosts at Northern Oasis Camping near Marquette, MI. $28 per site per night, open year round."
    />
    <Book />
  </>
)

export default BookPage
