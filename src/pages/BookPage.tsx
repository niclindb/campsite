import PageMeta from '../components/PageMeta'
import Book from '../components/Book'

const BookPage = () => (
  <>
    <PageMeta
      title="Book your stay"
      path="/book"
      description="Book an RV or tent site at Northern Oasis Camping near Marquette, MI. $28 per site per night, with canoe, kayak, tree tent and firewood add-ons."
    />
    <Book />
  </>
)

export default BookPage
