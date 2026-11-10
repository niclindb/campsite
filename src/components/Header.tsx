import { useState } from 'react'
import logo from '../assets/images/logo.webp'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header>
      <div className="header-container">
        <div className="logo">
          <a href="#home" onClick={closeMobileMenu}>
            <img src={logo} alt="Northern Oasis Camping" width="150" height="103" />
          </a>
        </div>
        <nav className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li><a href="#about" onClick={closeMobileMenu}>About</a></li>
            <li><a href="#sites" onClick={closeMobileMenu}>Sites</a></li>
            <li><a href="#gallery" onClick={closeMobileMenu}>Gallery</a></li>
            <li><a href="#info" onClick={closeMobileMenu}>Info</a></li>
            <li><a href="#contact" onClick={closeMobileMenu}>Contact</a></li>
            <li><a href="#book" className="book-now-btn" onClick={closeMobileMenu}>Book Now</a></li>
          </ul>
        </nav>
        <button 
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`} 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
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