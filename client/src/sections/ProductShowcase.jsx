import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUp, CookingPot, Utensils, PackageCheck } from 'lucide-react';
import HighlightList from '../components/HighlightList';
import Button from '../components/Button';
import { products } from '../data/products';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function ProductShowcase() {
  const shouldReduceMotion = useReducedMotion();

  const handleContactScroll = (e) => {
    e.preventDefault();
    const contactSec = document.getElementById('contact');
    if (contactSec) {
      contactSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-cream-light py-12">
      {/* Decorative intro divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-8">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          In-Depth Product Details
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900 mt-3">
          Behind Every Pure Bite &amp; Spoonful
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-base mt-2">
          Discover how each FynDry dehydrated product brings unbeatable flavor, effortless convenience, and farm-fresh vitality to your table.
        </p>
      </div>

      <div className="space-y-20 lg:space-y-32 py-10">
        {products.map((product, index) => {
          const isEven = index % 2 === 0;
          const {
            id,
            name,
            slug,
            tagline,
            highlights,
            image,
            accentColor,
            category,
            description,
            servingSuggestions,
            weight,
          } = product;

          const imageSlideAnim = shouldReduceMotion
            ? { initial: { opacity: 1 }, whileInView: { opacity: 1 } }
            : {
                initial: { opacity: 0, x: isEven ? -50 : 50 },
                whileInView: { opacity: 1, x: 0 },
                viewport: { once: true, margin: '-60px' },
                transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
              };

          const textSlideAnim = shouldReduceMotion
            ? { initial: { opacity: 1 }, whileInView: { opacity: 1 } }
            : {
                initial: { opacity: 0, y: 30 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: '-60px' },
                transition: { duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] },
              };

          return (
            <section
              key={product._id || id || slug}
              id={slug}
              className="relative scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              <div
                className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center ${
                  isEven ? '' : 'lg:flex-row-reverse'
                }`}
              >
                
                {/* Product Image Column */}
                <motion.div
                  {...imageSlideAnim}
                  className={`lg:col-span-6 relative flex items-center justify-center ${
                    isEven ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  {/* Accent-color decorative blob behind the image */}
                  <div
                    className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full filter blur-3xl opacity-25 pointer-events-none transform -translate-y-4"
                    style={{ backgroundColor: accentColor }}
                    aria-hidden="true"
                  />

                  {/* Card container with soft shadow */}
                  <div className="relative z-10 w-full max-w-md bg-white rounded-4xl p-6 sm:p-8 shadow-card-hover border border-gray-100 flex flex-col items-center">
                    <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-cream-light/60 p-4 flex items-center justify-center">
                      <picture className="w-full h-full flex items-center justify-center">
                        <source srcSet={product.detailImage || product.image} type="image/webp" />
                        {(product.detailImageFallback || product.imageFallback) && (
                          <source srcSet={product.detailImageFallback || product.imageFallback} type="image/png" />
                        )}
                        <img
                          src={product.detailImageFallback || product.detailImage || product.imageFallback || product.image}
                          alt={`Detailed view of FynDry ${name}`}
                          loading="lazy"
                          decoding="async"
                          width="450"
                          height="450"
                          className="w-full h-full object-contain rounded-2xl transform transition-transform duration-500 hover:scale-105 drop-shadow-md"
                        />
                      </picture>
                    </div>

                    {/* Quick spec strip */}
                    <div className="w-full mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <PackageCheck className="w-4 h-4 text-primary" />
                        Pack: {weight}
                      </span>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-white text-[11px] font-bold"
                        style={{ backgroundColor: accentColor }}
                      >
                        100% Pure
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Product Information Column */}
                <motion.div
                  {...textSlideAnim}
                  className={`lg:col-span-6 space-y-6 ${
                    isEven ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  {/* Category Pill */}
                  <div className="flex items-center gap-3">
                    <span
                      className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-xs"
                      style={{ backgroundColor: accentColor }}
                    >
                      {typeof category === 'object'
                        ? category?.name || category?.slug || 'Pantry'
                        : (category ? String(category).replace('-', ' ') : 'Pantry')}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Pure Dehydration
                    </span>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-heading text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                    {name}
                  </h3>

                  {/* Tagline in accent color */}
                  <p
                    className="font-heading text-xl sm:text-2xl font-bold tracking-tight"
                    style={{ color: accentColor }}
                  >
                    {tagline}
                  </p>

                  {/* Long description */}
                  <p className="font-body text-gray-700 text-base sm:text-lg leading-relaxed">
                    {description}
                  </p>

                  {/* All 4 Highlights as animated check-list */}
                  <div className="bg-white/70 backdrop-blur-xs rounded-3xl p-6 border border-gray-100 shadow-xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      Key Goodness Highlights
                    </h4>
                    <HighlightList
                      highlights={highlights}
                      accentColor={accentColor}
                      compact={false}
                    />
                  </div>

                  {/* Serving suggestions */}
                  {servingSuggestions && servingSuggestions.length > 0 && (
                    <div className="pt-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-woodBrown mb-2 flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5" />
                        Best Enjoyed In
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {servingSuggestions.map((item, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-semibold px-3 py-1 rounded-full bg-cream text-gray-700 border border-cream-dark"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inquire / Order Button */}
                  <div className="pt-2 flex items-center gap-4">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleContactScroll}
                    >
                      Inquire About {name}
                    </Button>
                    <a
                      href="#products"
                      className="text-sm font-bold text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      <ArrowUp className="w-4 h-4" />
                      Back to All
                    </a>
                  </div>

                </motion.div>

              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
