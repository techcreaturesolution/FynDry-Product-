import React from 'react';
import Hero from '../sections/Hero';
import MarqueeStrip from '../sections/MarqueeStrip';
import ProductsGrid from '../sections/ProductsGrid';
import ProductShowcase from '../sections/ProductShowcase';
import WhyFynDry from '../sections/WhyFynDry';
import Contact from '../sections/Contact';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Infinite Marquee Loop Strip */}
      <MarqueeStrip />

      {/* Filterable Products Grid */}
      <ProductsGrid />

      {/* In-depth Product Showcases (Alternating Left/Right) */}
      <ProductShowcase />

      {/* Why FynDry Value Proposition */}
      <WhyFynDry />

      {/* Contact / Inquiry Form */}
      <Contact />
    </>
  );
}
