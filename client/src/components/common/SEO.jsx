import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({
  title = 'FynDry | 100% Pure Solar Dehydrated Fruits & Produce',
  description = 'Enjoy nutrient-dense, sun-sweetened dehydrated apple slices, banana bites, and vegetable powders. Zero added sugar, no chemical preservatives, 100% natural crunch.',
  keywords = 'dehydrated fruits, apple slices, dried fruit snacks, vegetable powders, healthy snacks India, FynDry, solar dried food',
  canonical = 'https://fyndry.com',
  ogImage = 'https://fyndry.com/assets/og-image.jpg',
  ogType = 'website',
  schema = null,
}) {
  const fullTitle = title.includes('FynDry') ? title : `${title} | FynDry`;

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="FynDry" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
