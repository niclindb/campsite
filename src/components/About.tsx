import tentImage from '../assets/photo gallery/tent.png'

const About = () => {
  return (
    <section id="about" className="about">
      <div className="about-container">
        {/* Title */}
        <div className="about-title">
          <h2>About Northern Oasis</h2>
        </div>
        
        {/* Main Content */}
        <div className="about-main">
          <div className="about-image">
            <img src={tentImage} alt="Camping tent at Northern Oasis" />
          </div>
          
          <div className="about-content">
            <div className="about-text">
              <h3>Hosted by Joy and Brian L.</h3>
              <p>
                We built our home here in 2019 and are continually making improvements to the land. 
                We tap our trees for maple syrup in the spring—you will drive by our "sugar shack" 
                and raise chickens in our very nice coop—no roosters to awaken you!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About