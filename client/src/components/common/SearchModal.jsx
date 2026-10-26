import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useUiStore from '../../store/uiStore';
import productApi from '../../api/productApi';

export default function SearchModal() {
  const { isSearchModalOpen, closeSearchModal } = useUiStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await productApi.getProducts({ search: searchTerm.trim(), limit: 5 });
        const list = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        setResults(list);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelect = (slug) => {
    closeSearchModal();
    navigate(`/product/${slug}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      closeSearchModal();
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeSearchModal}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 font-body"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-gray-100 p-4 sm:p-5">
              <Search className="w-5 h-5 text-gray-400 ml-2 mr-3 flex-shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search dehydrated fruits, veg powders, soup powders..."
                className="w-full text-base sm:text-lg text-gray-800 placeholder-gray-400 focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={closeSearchModal}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </form>

            {/* Live Results Preview */}
            <div className="max-h-96 overflow-y-auto p-4 sm:p-6">
              {loading && (
                <div className="py-8 text-center text-sm text-gray-500">
                  Searching natural catalog...
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 px-2">
                    Matching Products
                  </p>
                  {results.map((product) => {
                    const price = product.variants?.[0]?.price || product.price || 189;
                    const imgUrl = product.images?.[0]?.url || product.image || '/assets/products/Apple_Slices_Natural_Goodness_Label.webp';
                    return (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => handleSelect(product.slug)}
                        className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-cream/60 transition-colors text-left group"
                      >
                        <div className="w-14 h-14 rounded-xl bg-cream-dark/40 overflow-hidden flex-shrink-0 p-1 flex items-center justify-center">
                          <img
                            src={imgUrl}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                            {product.name}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {product.tagline || product.shortDescription}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-sm font-extrabold text-primary">₹{price}</span>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all ml-auto mt-1" />
                        </div>
                      </button>
                    );
                  })}

                  <button
                    type="submit"
                    onClick={handleSearchSubmit}
                    className="w-full text-center py-2.5 text-xs font-bold text-primary hover:underline block"
                  >
                    View all results for "{searchTerm}" →
                  </button>
                </div>
              )}

              {!loading && searchTerm.trim() && results.length === 0 && (
                <div className="py-8 text-center text-sm text-gray-500">
                  No products found for "{searchTerm}".
                </div>
              )}

              {!searchTerm.trim() && (
                <div className="py-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Popular Searches
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Apple Slices', 'Garlic Powder', 'Soup Powder', 'Banana Bites', 'Beetroot'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSearchTerm(tag)}
                        className="text-xs px-3 py-1.5 rounded-full bg-cream hover:bg-primary-50 text-gray-700 hover:text-primary font-bold transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
