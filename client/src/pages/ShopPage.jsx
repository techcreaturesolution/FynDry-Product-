import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Sparkles, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import productApi from '../api/productApi';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          productApi.getProducts({
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            search: searchQuery || undefined,
            sort: sortBy !== 'default' ? sortBy : undefined,
          }),
          productApi.getCategories(),
        ]);
        setProducts(prodRes.products || []);
        setCategories(catRes || []);
      } catch (err) {
        console.error('Failed to load shop products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          100% Pure & Naturally Preserved
        </span>
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-gray-900 tracking-tight">
          Explore Our <span className="text-primary">Whole Pantry</span>
        </h1>
        <p className="mt-3 text-base text-gray-600 font-body">
          Gentle dehydration preserves up to 97% of natural vitamins, rich colors, and deep authentic aromas without single drop of preservatives.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-soft border border-gray-100 mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-cream text-gray-700 hover:bg-cream-dark'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setSelectedCategory('fruit-snack')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'fruit-snack'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-cream text-gray-700 hover:bg-cream-dark'
            }`}
          >
            Fruit Snacks
          </button>
          <button
            onClick={() => setSelectedCategory('powder')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'powder'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-cream text-gray-700 hover:bg-cream-dark'
            }`}
          >
            Culinary Powders
          </button>
          <button
            onClick={() => setSelectedCategory('instant')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'instant'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-cream text-gray-700 hover:bg-cream-dark'
            }`}
          >
            Instant Soups
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-60">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-primary bg-cream-light font-body"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-cream-light text-gray-700 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="default">Sort: Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-gray-500">Harvesting fresh goodness...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl p-8 border border-gray-100">
          <p className="font-heading font-bold text-xl text-gray-700">No products match your criteria</p>
          <p className="text-xs text-gray-500 mt-1">Try clearing your filters or search keyword.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setSortBy('default');
            }}
            className="mt-4 px-5 py-2 bg-primary text-white rounded-full text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {products.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
