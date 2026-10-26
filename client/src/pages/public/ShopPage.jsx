import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  PackageX,
  RotateCcw,
  Check,
  X,
} from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import productApi from '../../api/productApi';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State synchronized with URL queries
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialInStock = searchParams.get('inStock') === 'true';
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [rawSearch, setRawSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [inStockOnly, setInStockOnly] = useState(initialInStock);
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Set document title
  useEffect(() => {
    document.title = 'Shop Dehydrated Fruits & Culinary Powders | FynDry';
  }, []);

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(rawSearch);
    }, 350);
    return () => clearTimeout(timer);
  }, [rawSearch]);

  // Load Categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await productApi.getCategories();
        const list = Array.isArray(res.data) ? res.data : (res.data?.categories || []);
        setCategories(list);
      } catch (err) {
        console.warn('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Update URL Search Params helper
  const syncToUrl = (cat, search, minP, maxP, inStock, sort, page) => {
    const nextParams = new URLSearchParams();
    if (cat && cat !== 'all') nextParams.set('category', cat);
    if (search) nextParams.set('search', search);
    if (minP) nextParams.set('minPrice', minP);
    if (maxP) nextParams.set('maxPrice', maxP);
    if (inStock) nextParams.set('inStock', 'true');
    if (sort && sort !== 'newest') nextParams.set('sort', sort);
    if (page && page > 1) nextParams.set('page', String(page));
    setSearchParams(nextParams, { replace: true });
  };

  // Fetch Products whenever filters change
  useEffect(() => {
    let isMounted = true;
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 12,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: debouncedSearch.trim() || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          inStock: inStockOnly ? 'true' : undefined,
          sort: sortBy !== 'default' ? sortBy : undefined,
        };

        const res = await productApi.getProducts(params);
        if (isMounted) {
          const list = Array.isArray(res.data) ? res.data : (res.data?.products || []);
          setProducts(list);
          setTotalCount(res.total || list.length);
          setTotalPages(res.pages || Math.ceil((res.total || list.length) / 12) || 1);
        }
      } catch (err) {
        if (isMounted) {
          setProducts([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProducts();
    syncToUrl(
      selectedCategory,
      debouncedSearch.trim(),
      minPrice,
      maxPrice,
      inStockOnly,
      sortBy,
      currentPage
    );

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, debouncedSearch, minPrice, maxPrice, inStockOnly, sortBy, currentPage]);

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleInStockToggle = () => {
    setInStockOnly((prev) => !prev);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setRawSearch('');
    setDebouncedSearch('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    debouncedSearch ||
    minPrice ||
    maxPrice ||
    inStockOnly ||
    sortBy !== 'newest';

  return (
    <div className="pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10 pt-4">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          100% Pure & Naturally Preserved
        </span>
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-gray-900 tracking-tight">
          Explore Our <span className="text-primary">Natural Pantry</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-gray-600 font-body">
          Gentle dehydration preserves raw vitamins, crisp textures, and authentic flavors without oil or preservatives.
        </p>
      </div>

      {/* Filter & Search Bar Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-gray-100 mb-8 space-y-4">
        {/* Row 1: Category Chips & Sort Dropdown */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-cream text-gray-700 hover:bg-cream-dark'
              }`}
            >
              All Pantry Items
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id || cat.slug}
                type="button"
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-cream text-gray-700 hover:bg-cream-dark'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
            <label className="text-xs font-bold text-gray-500 whitespace-nowrap">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-cream text-xs font-bold text-gray-800 rounded-xl px-3 py-2 border border-cream-dark focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="featured">Featured First</option>
            </select>
          </div>
        </div>

        {/* Row 2: Search Input + Price Filter + In-Stock Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-gray-100 items-center">
          {/* Debounced Search */}
          <div className="sm:col-span-6 relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
              placeholder="Search by name, fruit, or root powder..."
              className="w-full bg-cream/40 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm font-body border border-gray-200 focus:outline-none focus:border-primary"
            />
            {rawSearch && (
              <button
                type="button"
                onClick={() => setRawSearch('')}
                className="absolute right-3 p-0.5 text-gray-400 hover:text-gray-600 rounded-full"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Price Range */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <input
              type="number"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setCurrentPage(1);
              }}
              className="w-1/2 bg-cream/40 rounded-xl px-3 py-2 text-xs font-body border border-gray-200 focus:outline-none focus:border-primary"
            />
            <span className="text-gray-400 text-xs">-</span>
            <input
              type="number"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setCurrentPage(1);
              }}
              className="w-1/2 bg-cream/40 rounded-xl px-3 py-2 text-xs font-body border border-gray-200 focus:outline-none focus:border-primary"
            />
          </div>

          {/* In-Stock Toggle Button */}
          <div className="sm:col-span-3 flex items-center justify-start sm:justify-end">
            <button
              type="button"
              onClick={handleInStockToggle}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                inStockOnly
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                  inStockOnly
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              >
                {inStockOnly && <Check className="w-3 h-3 stroke-[3]" />}
              </span>
              <span>In Stock Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header Count & Clear Actions */}
      <div className="flex items-center justify-between mb-6 px-1">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-body">
          Showing {products.length} of {totalCount} {totalCount === 1 ? 'product' : 'products'}
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brandRed hover:underline transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      {/* Skeletons Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 space-y-4">
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

      {/* Product Grid */}
      {!loading && products.length > 0 && (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {products.map((product) => (
            <ProductCard key={product._id || product.slug} product={product} />
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <EmptyState
          icon={PackageX}
          title="No products match your criteria"
          description="Try broadening your search term or clearing the category and price filters."
          actionText="Reset All Filters"
          onAction={handleResetFilters}
          className="my-12"
        />
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
