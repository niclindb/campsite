import { useEffect, useState } from 'react'
import PageMeta from '../components/PageMeta'
import Book, { type BookLayout } from '../components/Book'

const BookPage = () => {
  // Mock-up only: ?layout=b or ?layout=c previews the other layouts.
  const [layout, setLayout] = useState<BookLayout>('a')
  useEffect(() => {
    const l = new URLSearchParams(window.location.search).get('layout')
    if (l === 'b' || l === 'c') setLayout(l)
  }, [])

  return (
    <>
      <PageMeta
        title="Book your stay"
        path="/book"
        description="Pick your dates and book a tent or RV site at Northern Oasis Camping near Marquette, MI. $28 per site per night, April to November."
      />
      <Book layout={layout} />
    </>
  )
}

export default BookPage
