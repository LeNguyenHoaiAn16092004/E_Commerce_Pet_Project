import { Helmet } from 'react-helmet-async'

export default function SEO({ title, desc, image, jsonLd, noIndex }) {
  const full = title ? `${title} | ShopFun` : 'ShopFun — Shop vui vẻ, giá tốt, ship siêu nhanh'
  return (
    <Helmet>
      <title>{full}</title>
      {desc && <meta name="description" content={desc} />}
      <meta property="og:title" content={full} />
      {desc && <meta property="og:description" content={desc} />}
      {image && <meta property="og:image" content={image} />}
      {noIndex && <meta name="robots" content="noindex" />}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}
