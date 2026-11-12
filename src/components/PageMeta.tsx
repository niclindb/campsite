import { Head } from 'vite-react-ssg'
import { site } from '../content/site'

type Props = { title?: string; description: string; path: string }

// Sets each page's own title, description and link previews. Once the
// website's address is set (websiteUrl in contact-info.ts), links use the
// full address, which search engines and link previews need.
const PageMeta = ({ title, description, path }: Props) => {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | RV & Tent Camping near Marquette, MI`
  const url = `${site.url}${path}`
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${site.url}/og-image.jpg`} />
      {site.url && <link rel="canonical" href={url} />}
    </Head>
  )
}

export default PageMeta
