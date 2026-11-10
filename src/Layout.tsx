import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import './App.css'
import './sections.css'
import Header from './components/Header'
import Footer from './components/Footer'

const Layout = () => {
  const { pathname, hash } = useLocation()

  // Jump to the section named in the link (/#sites), or to the top on a new page.
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      {pathname.replace(/\/$/, '') !== '/book' && (
        <Link to="/book" className="mobile-book-bar">Book your stay</Link>
      )}
    </>
  )
}

export default Layout
