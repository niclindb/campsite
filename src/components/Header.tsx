import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '../assets/images/logo.webp'
import { site } from '../content/site'

// PREVIEW ONLY: ?hdr=a|b|c picks a mock-up variant.
const getVariant = () => {
  if (typeof window === 'undefined') return 'a'
  return new URLSearchParams(window.location.search).get('hdr') ?? 'a'
}

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [variant] = useState(getVariant)
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const close = () => setIsMobileMenuOpen(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const classes = [
    'site-header',
    `hdr-${variant}`,
    isHome ? 'is-home' : '',
    scrolled ? 'is-scrolled' : '',
    isMobileMenuOpen ? 'menu-open' : '',
  ].filter(Boolean).join(' ')

  return (
    <header className={classes}>
      {variant === 'c' && (
        <div className="header-strip">
          <p>
            <span>Open {site.season}</span>
            <span aria-hidden="true">·</span>
            <span>${site.pricePerSiteNight} per site, per night</span>
            <span aria-hidden="true" className="strip-extra">·</span>
            <span className="strip-extra">★ {site.rating.recommendPercent}% recommend on Hipcamp</span>
          </p>
        </div>
      )}
      <div className="header-container">
        <div className="logo">
          <Link to="/" onClick={close}>
            <img src={logo} alt="Northern Oasis Camping, home" width="150" height="103" />
          </Link>
        </div>
        <nav id="main-menu" className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`} aria-label="Main">
          <ul className="nav-list">
            <li><Link to="/#sites" onClick={close}>Sites</Link></li>
            <li><Link to="/#gallery" onClick={close}>Gallery</Link></li>
            <li><NavLink to="/explore" onClick={close}>Things to do</NavLink></li>
            <li><NavLink to="/info" onClick={close}>Info & FAQ</NavLink></li>
            <li><Link to="/#contact" onClick={close}>Contact</Link></li>
            <li className="book-item"><NavLink to="/book" className="book-now-btn" onClick={close}>Book Now</NavLink></li>
          </ul>
        </nav>
        <button
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="main-menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  )
}

export default Header
