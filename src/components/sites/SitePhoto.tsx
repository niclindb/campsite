// One photo of a camping area, tagged "Temporary photo" while it is a stand-in.
type Props = { src: string; srcSet?: string; sizes?: string; alt: string; temporary: boolean; className?: string }

const SitePhoto = ({ src, srcSet, sizes, alt, temporary, className = '' }: Props) => (
  <div className={`site-photo ${className}`}>
    <img src={src} srcSet={srcSet || undefined} sizes={srcSet ? sizes : undefined} alt={temporary ? `Placeholder photo: ${alt}` : alt} loading="lazy" />
    {temporary && <span className="temp-tag">Temporary photo</span>}
  </div>
)

export default SitePhoto
