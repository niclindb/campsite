import lakeImage from '../assets/photo gallery/Lake.png'

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-background">
        <img src={lakeImage} alt="Beautiful lake at Northern Oasis Camping" />
        <div className="hero-overlay"></div>
      </div>
      <div className="hero-content">
        <div className="hero-text">
          <h1>Experience Nature's Paradise</h1>
          <p>Discover the perfect blend of adventure and tranquility at Northern Oasis Camping. 
             Nestled beside pristine waters and surrounded by breathtaking wilderness.</p>
          <div className="hero-buttons">
            <a href="#book" className="hero-btn primary">Book Your Stay</a>
            <a href="#gallery" className="hero-btn secondary">View Gallery</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero 