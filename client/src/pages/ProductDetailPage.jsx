import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Zap,
  ArrowLeft,
  CheckCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  Sparkles,
  Tag,
} from 'lucide-react';
import productApi from '../api/productApi';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import HighlightList from '../components/HighlightList';
import { getProductAssets } from '../utils/productImages';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const { addToCart, setBuyNowItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productApi.getProductBySlug(slug);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center bg-cream">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-500">Preparing fresh details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-20 min-h-screen max-w-xl mx-auto px-4 text-center">
        <h2 className="font-heading font-bold text-3xl text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-gray-600 mb-6">The product you are looking for does not exist or has been discontinued.</p>
        <Link
          to="/shop"
          className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const {
    _id,
    id,
    name,
    tagline,
    description,
    category,
    weight,
    price = 249,
    originalPrice = 299,
    stock = 50,
    highlights = [],
    servingSuggestions = [],
    nutritionHighlights = [],
    image,
    imageFallback,
    detailImage,
    detailImageFallback,
    accentColor = '#1F6B3A',
  } = product;

  const assets = getProductAssets(product);
  const images = [
    { src: assets.image, fallback: assets.imageFallback, label: 'Packaging View' },
    ...(assets.detailImage
      ? [{ src: assets.detailImage, fallback: assets.detailImageFallback, label: 'Serving & Texture' }]
      : []),
  ];

  const handleAddToCart = () => {
    addToCart({ ...product, image: assets.image }, quantity, isAuthenticated);
  };

  const handleBuyNow = () => {
    setBuyNowItem({
      product: {
        _id: _id || id,
        name,
        slug,
        price,
        originalPrice,
        image: assets.image,
        weight,
        category,
      },
      quantity,
    });
    navigate('/checkout');
  };

  const discountPercent =
    originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;

  return (
    <div className="pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Back Button */}
      <Link
        to="/shop"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Products</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-3xl p-6 sm:p-10 border border-cream-dark shadow-soft flex items-center justify-center relative overflow-hidden">
            <div
              className="absolute inset-8 rounded-full opacity-15 filter blur-2xl pointer-events-none"
              style={{ backgroundColor: accentColor }}
            />
            <img
              src={images[activeImageIndex]?.src}
              alt={name}
              className="max-h-full max-w-full object-contain relative z-10 drop-shadow-md"
              onError={(e) => {
                if (images[activeImageIndex]?.fallback) {
                  e.currentTarget.src = images[activeImageIndex].fallback;
                }
              }}
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-24 h-24 rounded-2xl p-2 bg-white border-2 transition-all overflow-hidden ${
                    activeImageIndex === idx
                      ? 'border-primary shadow-md scale-105'
                      : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.src}
                    alt=""
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      if (img.fallback) e.currentTarget.src = img.fallback;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Actions */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cream text-woodBrown border border-cream-dark">
                {typeof category === 'object' ? category?.name || category?.slug : category || 'Dehydrated Pure'}
              </span>
              {stock > 0 ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold text-primary bg-primary-50 border border-primary-100">
                  In Stock ({stock} available)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold text-brandRed bg-brandRed/10">
                  Out of Stock
                </span>
              )}
            </div>

            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-900 tracking-tight">
              {name}
            </h1>
            <p className="font-heading font-medium text-base sm:text-lg mt-1" style={{ color: accentColor }}>
              {tagline}
            </p>

            {/* Price section */}
            <div className="mt-4 p-4 rounded-2xl bg-cream/70 border border-cream-dark flex items-baseline gap-3">
              <span className="font-heading font-black text-3xl text-primary">₹{price}</span>
              {originalPrice > price && (
                <>
                  <span className="text-base text-gray-400 line-through">₹{originalPrice}</span>
                  <span className="text-xs font-extrabold text-brandRed bg-brandRed/10 px-2 py-0.5 rounded-full">
                    Save {discountPercent}%
                  </span>
                </>
              )}
              <span className="text-xs text-gray-500 ml-auto font-medium">Net Weight: {weight}</span>
            </div>

            {/* Nutrition Highlights */}
            {nutritionHighlights.length > 0 && (
              <div className="mt-5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                  Nutritional Highlights
                </span>
                <div className="flex flex-wrap gap-2">
                  {nutritionHighlights.map((nh, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-white text-gray-800 border border-gray-200 shadow-2xs"
                    >
                      ✨ {nh}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                About This Preserved Harvest
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed font-body">{description}</p>
            </div>

            {/* Key Highlights */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <HighlightList highlights={highlights} accentColor={accentColor} />
            </div>

            {/* Serving Suggestions */}
            {servingSuggestions.length > 0 && (
              <div className="mt-6 p-4 rounded-2xl bg-white border border-gray-100 shadow-soft">
                <h4 className="text-xs font-bold uppercase tracking-wider text-woodBrown mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Recommended Ways to Enjoy
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                  {servingSuggestions.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity & Buy CTAs */}
          <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Quantity</span>
              <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-cream text-gray-600 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-sm font-bold text-gray-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-cream text-gray-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={stock <= 0}
                className="w-full py-3.5 px-6 rounded-2xl font-heading font-bold text-sm text-primary bg-primary-50 hover:bg-primary-100 border border-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Basket</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={stock <= 0}
                className="w-full py-3.5 px-6 rounded-2xl font-heading font-bold text-sm text-white bg-primary hover:bg-primary-dark shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-accent-banana fill-accent-banana" />
                <span>Buy Now (Instant Checkout)</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-gray-500">
              <div className="p-2 rounded-xl bg-white/70 border border-gray-100 flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-primary" />
                <span>Free Ship &gt; ₹499</span>
              </div>
              <div className="p-2 rounded-xl bg-white/70 border border-gray-100 flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>FSSAI Certified</span>
              </div>
              <div className="p-2 rounded-xl bg-white/70 border border-gray-100 flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-primary" />
                <span>Freshness Assured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
