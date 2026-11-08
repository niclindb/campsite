import './App.css'
import Hero from './components/Hero'
import Location from './components/Location'
import Header from './components/Header'
import About from './components/About'

function App() {
  return (
    <>
      <Header />
      <Hero />
      <About />
      <Location />
      <main>
        <h2>Welcome to Northern Oasis Camping</h2>
        <p>
          Northern Oasis Camping is a place where you can relax and enjoy the nature.
        </p>
      </main>
      <footer>
        <p>Copyright 2025 Northern Oasis Camping</p>
      </footer>
    </>
  )
}

export default App
