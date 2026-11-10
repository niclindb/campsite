import tentImage from '../assets/images/tent.webp'
import { site } from '../content/site'

const About = () => {
  return (
    <section id="about" className="about">
      <div className="about-container">
        <div className="about-title">
          <h2>About Northern Oasis</h2>
        </div>
        <div className="about-main">
          <div className="about-image">
            <img src={tentImage} alt="Orange tent in the misty maple forest at Northern Oasis" loading="lazy" />
          </div>
          <div className="about-content">
            <div className="about-text">
              <h3>Hosted by {site.hosts}</h3>
              <p>
                We built our home here in 2019 and are continually making improvements to the land.
                We tap our trees for maple syrup in the spring (you will drive by our "sugar shack")
                and raise chickens in our very nice coop. No roosters to awaken you!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
