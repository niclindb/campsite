import logo from '../assets/images/logo.webp'
import { site } from '../content/site'

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <img src={logo} alt={site.name} width="160" loading="lazy" />
        <div>
          <p>Between Marquette and Negaunee, Michigan</p>
          <p>Open {site.season}</p>
        </div>
        <nav aria-label="Footer">
          <a href="#book">Book</a>
          <a href="#info">FAQ</a>
          <a href="#contact">Contact</a>
          <a href={site.hipcampUrl} target="_blank" rel="noopener">Hipcamp</a>
        </nav>
      </div>
      <p className="copyright">© {new Date().getFullYear()} {site.name}</p>
    </footer>
  )
}

export default Footer
