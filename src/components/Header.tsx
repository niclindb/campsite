import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/images/logo.webp'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const close = () => setIsMobileMenuOpen(false)

  return (
    <header>
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
            <li><NavLink to="/book" className="book-now-btn" onClick={close}>Book Now</NavLink></li>
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
