import { Helmet } from 'react-helmet-async'

// cast to any to avoid React 19 type errors
const HelmetComponent = Helmet as any

interface SEOProps {
  title: string
  description: string
  canonical?: string
  openGraph?: {
    title?: string
    description?: string
    image?: string
    url?: string
  }
}

export function SEO({ title, description, canonical, openGraph }: SEOProps) {

  return (
    <HelmetComponent>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={openGraph?.title || title} />
      <meta property="og:description" content={openGraph?.description || description} />
      {openGraph?.image && <meta property="og:image" content={openGraph.image} />}
      <meta property="og:url" content={openGraph?.url || window.location.href} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={openGraph?.title || title} />
      <meta name="twitter:description" content={openGraph?.description || description} />
      {openGraph?.image && <meta name="twitter:image" content={openGraph.image} />}
    </HelmetComponent>
  )
}
