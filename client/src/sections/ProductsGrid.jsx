import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionTitle from '../components/SectionTitle';
import ProductCard from '../components/ProductCard';
import productService from '../services/productService';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function ProductsGrid() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    async function loadData() {
      try {
        const [allProds, allCats] = await Promise.all([
          productService.getAllProducts(),
          productService.getCategories(),
        ]);
        setProductsList(allProds);
        setCategoriesList(allCats);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts =
    selectedCategory === 'all'
      ? productsList
      : productsList.filter((p) => {
          if (!p.category) return false;
          if (typeof p.category === 'object') {
            return (
              p.category.slug === selectedCategory ||
              p.category._id === selectedCategory ||
              p.category.name === selectedCategory
            );
          }
          return p.category === selectedCategory;
        });

  return (
    <section id="products" className="py-20 lg:py-28 relative overflow-hidden bg-cream">
      {/* Background soft ambient blobs */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-primary/5 filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-96 h-96 rounded-full bg-woodBrown/5 filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <SectionTitle
          badge="Our Natural Range"
          title="Naturally Preserved Goodness"
          subtitle="Explore our selection of crisp, sun-dried fruit snacks and pure vegetable powders created to nourish and elevate your everyday kitchen."
          align="center"
          badgeColor="bg-primary-100 text-primary-700 border-primary-200"
        />

        {/* Category Filter Tabs */}
        <div className="mt-10 mb-12 flex justify-center">
          <div
            role="tablist"
            aria-label="Product categories"
            className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 bg-cream-dark rounded-full border border-primary/10 shadow-xs max-w-full"
          >
            {categoriesList.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  id={`tab-${cat.id}`}
                  aria-selected={isSelected}
                  aria-controls="products-grid-list"
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`relative px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary flex items-center gap-2 ${
                    isSelected
                      ? 'text-white'
                      : 'text-gray-700 hover:text-primary hover:bg-cream/80'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeFilterPill"
                      className="absolute inset-0 bg-primary rounded-full shadow-soft"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                  {cat.count !== undefined && (
                    <span
                      className={`relative z-10 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-primary-100 text-primary-800'
                      }`}
                    >
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id || product.id || product.slug}
                product={product}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Quick summary note under grid */}
        <div className="mt-14 text-center">
          <p className="text-sm text-gray-500 font-medium">
            Need detailed ingredient profiles or recipe suggestions? Click{' '}
            <strong className="text-primary font-bold">View Details</strong> on any product to jump to its showcase below.
          </p>
        </div>

      </div>
    </section>
  );
}
