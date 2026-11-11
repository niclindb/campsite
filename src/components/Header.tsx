import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '../assets/images/logo.webp'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
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
    isHome ? 'is-home' : '',
    scrolled ? 'is-scrolled' : '',
    isMobileMenuOpen ? 'menu-open' : '',
  ].filter(Boolean).join(' ')

  return (
    <header className={classes}>
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
            <li><NavLink to="/#location" onClick={close}>Things to do</NavLink></li>
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
