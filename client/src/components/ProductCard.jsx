import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Tag, ShoppingBag, Zap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import HighlightList from './HighlightList';
import { useReducedMotion } from '../hooks/useReducedMotion';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import { getProductAssets } from '../utils/productImages';

const ProductCard = React.forwardRef(function ProductCard({ product }, ref) {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { addToCart, setBuyNowItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const {
    _id,
    id,
    name,
    slug,
    tagline,
    highlights = [],
    accentColor = '#1F6B3A',
    category,
    weight,
    price = 249,
    originalPrice = 299,
    nutritionHighlights = [],
  } = product;

  const assets = getProductAssets(product);
  const displayImage = assets.image;
  const displayFallback = assets.imageFallback;

  const previewHighlights = highlights.slice(0, 2);

  const categoryLabels = {
    'fruit-snack': 'Fruit Snack',
    'powder': 'Culinary Powder',
    'instant': 'Instant Comfort',
  };

  const categoryStr =
    typeof category === 'object'
      ? category?.name || category?.slug || 'Pantry'
      : category || 'Pantry';

  const categorySlug =
    typeof category === 'object'
      ? category?.slug || ''
      : category || '';

  const categoryDisplay =
    categoryLabels[categorySlug] || categoryLabels[categoryStr] || categoryStr;

  const defaultVariant = product.variants?.[0] || null;
  const hasMultipleVariants = Array.isArray(product.variants) && product.variants.length > 1;
  const minPrice =
    product.minPrice ||
    (product.variants?.length
      ? Math.min(...product.variants.map((v) => v.price))
      : (price || 249));
  const effectivePrice = defaultVariant ? defaultVariant.price : minPrice;
  const effectiveMrp =
    defaultVariant?.mrp || originalPrice || (effectivePrice ? Math.round(effectivePrice * 1.25) : 299);
  const effectiveWeight = defaultVariant?.label || weight || '100g';

  const isOutOfStock =
    product.inStock === false ||
    (product.variants?.length
      ? product.variants.every((v) => (v.stock || 0) <= 0)
      : product.stock !== undefined && product.stock <= 0);

  const discountPercent =
    effectiveMrp && effectiveMrp > minPrice
      ? Math.round(((effectiveMrp - minPrice) / effectiveMrp) * 100)
      : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, defaultVariant, 1, isAuthenticated);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    setBuyNowItem({
      productId: _id || id,
      variantId: defaultVariant?._id,
      product: {
        _id: _id || id,
        name,
        slug,
        price: effectivePrice,
        originalPrice: effectiveMrp,
        image: displayImage,
        weight: effectiveWeight,
        category: categoryStr,
      },
      variantLabel: effectiveWeight,
      price: effectivePrice,
      quantity: 1,
      lineTotal: effectivePrice,
    });

    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent('/checkout?mode=buy_now')}`);
    } else {
      navigate('/checkout?mode=buy_now');
    }
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
      whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={
        shouldReduceMotion
          ? {}
          : {
              y: -8,
              transition: { duration: 0.3, ease: 'easeOut' },
            }
      }
      className="group relative bg-white rounded-3xl p-6 sm:p-7 shadow-card hover:shadow-card-hover border border-gray-100 flex flex-col justify-between transition-all duration-300 overflow-hidden"
    >
      {/* Subtle accent glow top gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-2 transition-all duration-300 group-hover:h-3"
        style={{ backgroundColor: accentColor }}
      />

      <div>
        {/* Category tag & weight & discount */}
        <div className="flex items-center justify-between mb-4 mt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-cream text-woodBrown border border-cream-dark">
            <Tag className="w-3 h-3 text-woodBrown" />
            {categoryDisplay}
          </span>
          <div className="flex items-center gap-1.5">
            {discountPercent && (
              <span className="text-[11px] font-bold text-brandRed bg-brandRed/10 px-2 py-0.5 rounded-full">
                {discountPercent}% OFF
              </span>
            )}
            {effectiveWeight && (
              <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-0.5 rounded-full">
                {effectiveWeight}
              </span>
            )}
          </div>
        </div>

        {/* Product Image */}
        <Link
          to={`/product/${slug}`}
          className="relative aspect-square w-full rounded-2xl overflow-hidden bg-cream-light p-3 mb-6 shadow-inner flex items-center justify-center block"
        >
          {isOutOfStock && (
            <span className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-sm text-white shadow-sm">
              Out of Stock
            </span>
          )}

          <div
            className="absolute inset-4 rounded-full opacity-15 filter blur-xl transition-transform duration-500 group-hover:scale-125 pointer-events-none"
            style={{ backgroundColor: accentColor }}
          />

          <img
            src={displayImage || displayFallback}
            alt={`FynDry ${name} - ${tagline}`}
            loading="lazy"
            decoding="async"
            width="400"
            height="400"
            className={`relative z-10 w-full h-full object-contain rounded-xl transform transition-transform duration-500 group-hover:scale-105 drop-shadow-sm ${
              isOutOfStock ? 'opacity-60 grayscale-[30%]' : ''
            }`}
            onError={(e) => {
              if (displayFallback && e.currentTarget.src !== displayFallback) {
                e.currentTarget.src = displayFallback;
              }
            }}
          />
        </Link>

        {/* Product Titles & Price */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link to={`/product/${slug}`}>
              <h3 className="font-heading text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-200">
                {name}
              </h3>
            </Link>
            <p
              className="font-medium text-xs mt-0.5 line-clamp-1"
              style={{ color: accentColor }}
            >
              {tagline}
            </p>
          </div>
          <div className="text-right shrink-0">
            {hasMultipleVariants && (
              <span className="text-[10px] text-gray-400 block font-semibold leading-none mb-0.5">
                From
              </span>
            )}
            <span className="font-heading font-black text-xl text-primary">₹{minPrice}</span>
            {effectiveMrp > minPrice && (
              <span className="block text-xs text-gray-400 line-through">₹{effectiveMrp}</span>
            )}
          </div>
        </div>

        {/* Quick Nutrition Badges */}
        {nutritionHighlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 my-3">
            {nutritionHighlights.map((nh, i) => (
              <span
                key={i}
                className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-50 text-gray-600 border border-gray-100"
              >
                {nh}
              </span>
            ))}
          </div>
        )}

        {/* First 2 Highlights */}
        <div className="border-t border-gray-100 pt-3 mb-5">
          <HighlightList
            highlights={previewHighlights}
            accentColor={accentColor}
            compact={true}
          />
        </div>
      </div>

      {/* Action Buttons: Add to Cart & Buy Now */}
      <div className="pt-2 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl font-bold text-xs transition-all active:scale-95 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'text-primary bg-primary-50 hover:bg-primary-100 border border-primary/20'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl font-bold text-xs transition-all active:scale-95 ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'text-white bg-primary hover:bg-primary-dark shadow-sm'
            }`}
          >
            <Zap
              className={`w-3.5 h-3.5 ${
                isOutOfStock ? 'text-gray-400' : 'text-accent-banana fill-accent-banana'
              }`}
            />
            <span>{isOutOfStock ? 'Unavailable' : 'Buy Now'}</span>
          </button>
        </div>

        <Link
          to={`/product/${slug}`}
          className="w-full inline-flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors"
        >
          <span>View Detailed Specs</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
});

export default ProductCard;
