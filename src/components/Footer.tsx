import { Link } from 'react-router-dom'
import logo from '../assets/images/logo.webp'
import { site } from '../content/site'

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <Link to="/#home" className="logo-link" aria-label={`${site.name} home`}>
          <img src={logo} alt={site.name} width="160" loading="lazy" />
        </Link>
        <div>
          <p>Come and enjoy some peace and quiet at our Northern Oasis!</p>
        </div>
        <nav aria-label="Footer">
          <Link to="/book">Book</Link>
          <Link to="/info">FAQ</Link>
          <Link to="/#contact">Contact</Link>
          <a href={site.hipcampUrl} target="_blank" rel="noopener">Hipcamp</a>
        </nav>
      </div>
      <p className="copyright">
        © {new Date().getFullYear()} {site.name} · <Link to="/privacy">Privacy</Link> ·{' '}
        <Link to="/terms">Terms</Link> · Website by{' '}
        <a href="https://niclindb.github.io" target="_blank" rel="noopener">Lindberg Dev</a>
      </p>
    </footer>
  )
}

export default Footer
