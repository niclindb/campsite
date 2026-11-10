import './App.css'
import './sections.css'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Sites from './components/Sites'
import Gallery from './components/Gallery'
import Reviews from './components/Reviews'
import Location from './components/Location'
import Nearby from './components/Nearby'
import Info from './components/Info'
import Book from './components/Book'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Sites />
        <Gallery />
        <Reviews />
        <Location />
        <Nearby />
        <Info />
        <Book />
        <Contact />
      </main>
      <Footer />
      <a href="#book" className="mobile-book-bar">Book your stay</a>
    </>
  )
}

export default App
