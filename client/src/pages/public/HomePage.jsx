import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import Hero from '../../sections/Hero';
import MarqueeStrip from '../../sections/MarqueeStrip';
import WhyFynDry from '../../sections/WhyFynDry';
import ProductCard from '../../components/ProductCard';
import Skeleton from '../../components/ui/Skeleton';
import productApi from '../../api/productApi';
import SEO from '../../components/common/SEO';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadFeatured() {
      try {
        const res = await productApi.getFeaturedProducts();
        if (isMounted) {
          const list = Array.isArray(res.data) ? res.data : (res.data?.products || []);
          setFeaturedProducts(list);
        }
      } catch (err) {
        console.warn('Could not load featured products:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      <SEO
        title="FynDry | 100% Pure Solar Dehydrated Fruits & Produce"
        description="Order premium solar-dehydrated crisp fruits and vegetable powders. Zero added sugar, no chemical preservatives, rich natural crunch."
        canonical="https://fyndry.com"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'FynDry',
          url: 'https://fyndry.com',
          logo: 'https://fyndry.com/assets/logo.png',
        }}
      />
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Infinite Brand Marquee Strip */}
      <MarqueeStrip />

      {/* 3. Featured Products Grid (Live from API) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Handpicked Favorites</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-gray-900 tracking-tight">
              Featured Natural Goodness
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 font-body max-w-xl">
              100% pure dehydrated fruit bites and nutrient-dense culinary powders, sealed for everyday vitality.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark group transition-colors self-start md:self-auto"
          >
            <span>Explore All Products</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-6 border border-gray-100 space-y-4">
                <Skeleton className="w-full aspect-square rounded-2xl" />
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
                <div className="pt-4 flex justify-between items-center">
                  <Skeleton className="h-6 w-1/4 rounded-md" />
                  <Skeleton className="h-10 w-28 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Featured Products Listing */}
        {!loading && featuredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredProducts.slice(0, 3).map((product) => (
              <ProductCard key={product._id || product.slug} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Why FynDry Value Proposition */}
      <WhyFynDry />

      {/* 5. Short CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary to-primary-dark text-white p-8 sm:p-14 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left"
        >
          {/* Subtle decorative circles */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-black/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-cream text-xs font-bold uppercase tracking-wider mb-3">
              Zero Preservatives • Zero Oil
            </span>
            <h3 className="text-2xl sm:text-4xl font-heading font-black tracking-tight leading-tight">
              Ready to Upgrade Your Daily Pantry?
            </h3>
            <p className="mt-3 text-sm sm:text-base text-cream/90 font-body">
              Order fresh dried superfoods directly to your door with quick shipping across India.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-4 justify-center md:justify-start shrink-0">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-cream text-primary hover:bg-white font-bold text-base shadow-soft hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-5 h-5 text-primary" />
              <span>Shop All Products</span>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
