import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import './App.css'
import './sections.css'
import './info.css'
import './book.css'
import './legal.css'
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

  // Counts a page view for the hosts' dashboard. No cookies, and nothing about
  // the visitor is kept: just the page, and on the first page of a visit the
  // name of the website they came from (see api/view.ts).
  const firstView = useRef(true)
  useEffect(() => {
    if (import.meta.env.DEV) return
    let from: string | undefined
    if (firstView.current) {
      firstView.current = false
      const ref = document.referrer
      let external = true
      try {
        external = !ref || new URL(ref).host !== window.location.host
      } catch {
        // An unreadable referrer counts as coming from outside.
      }
      if (external) from = ref || 'direct'
    }
    fetch('/api/view', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path: pathname, from }),
      keepalive: true,
    }).catch(() => {})
  }, [pathname])

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default Layout
