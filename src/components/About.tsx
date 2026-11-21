import tentImage from '../assets/images/tent.webp'
import fallImage from '../assets/gallery/03-fall-coffee.webp'
import fallSrcSet from '../assets/gallery/03-fall-coffee.webp?w=480;960&format=webp&quality=72&as=srcset&imagetools'
import winterImage from '../assets/gallery/20-winter.webp'
import winterSrcSet from '../assets/gallery/20-winter.webp?w=480;960&format=webp&quality=72&as=srcset&imagetools'
import { about, site } from '../content/site'

// Story and hosts' signature beside a scrapbook collage of three seasons.
const About = () => {
  return (
    <section id="about" className="about" aria-labelledby="about-title">
      <div className="container about-grid">
        <div className="about-text">
          <p className="about-eyebrow">About Northern Oasis</p>
          <h2 id="about-title">{about.heading}</h2>
          {about.paragraphs.map((p) => (
            <p key={p} className="about-copy">{p}</p>
          ))}
          <p className="about-signoff">
            <span className="about-signoff-name">{site.hosts}</span>
            <span className="about-signoff-role">Your hosts · {site.rating.badges[0]} on Hipcamp</span>
          </p>
        </div>
        <div className="about-collage">
          <img className="about-collage-main" src={tentImage} alt="Orange tent in the misty maple forest in summer" loading="lazy" />
          <img className="about-collage-fall" src={fallImage} srcSet={fallSrcSet} sizes="(max-width: 900px) 50vw, 300px" alt="Coffee among fallen maple leaves in autumn" loading="lazy" />
          <img className="about-collage-winter" src={winterImage} srcSet={winterSrcSet} sizes="(max-width: 900px) 50vw, 300px" alt="Campers in the snowy woods in winter" loading="lazy" />
          <span className="about-collage-note">{about.collageNote}</span>
        </div>
      </div>
    </section>
  )
}

export default About
