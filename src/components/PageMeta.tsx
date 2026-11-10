import { Head } from 'vite-react-ssg'
import { site } from '../content/site'

type Props = { title?: string; description: string; path: string }

// Sets each page's own title, description and link previews.
const PageMeta = ({ title, description, path }: Props) => {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | RV & Tent Camping near Marquette, MI`
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={path} />
    </Head>
  )
}

export default PageMeta
