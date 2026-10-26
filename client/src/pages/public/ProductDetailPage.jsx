import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Zap,
  ArrowLeft,
  CheckCircle,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
  Tag,
  PackageCheck,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';
import productApi from '../../api/productApi';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import ProductCard from '../../components/ProductCard';
import SEO from '../../components/common/SEO';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);

  // Zoom magnifier states
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
  const imageContainerRef = useRef(null);

  const { addToCart, setBuyNowItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Load product data & related products
  useEffect(() => {
    let isMounted = true;
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await productApi.getProductBySlug(slug);
        if (isMounted) {
          const prodData = res.data?.product || res.data;
          setProduct(prodData);
          setSelectedVariantIndex(0);
          setQuantity(1);
          setActiveImageIndex(0);

          // Update SEO document title and meta
          document.title = `${prodData.name} | FynDry - Goodness, Naturally Preserved`;

          // Fetch related products from same category or general catalog
          try {
            const catId = typeof prodData.category === 'object' ? prodData.category?.slug : prodData.category;
            const relRes = await productApi.getProducts({
              category: catId || undefined,
              limit: 4,
            });
            const list = Array.isArray(relRes.data) ? relRes.data : (relRes.data?.products || []);
            setRelatedProducts(list.filter((p) => p._id !== prodData._id).slice(0, 3));
          } catch (relErr) {
            // ignore
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Handle zoom lens on mouse move
  const handleMouseMove = (e) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-sm font-bold text-gray-500 font-body">
          Loading pure natural specifications...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-24 max-w-xl mx-auto px-4 text-center font-body">
        <h2 className="font-heading font-black text-3xl text-gray-900 mb-2">
          Product Not Found
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          The natural pantry item you are looking for is currently unavailable or has been archived.
        </p>
        <Button href="/shop" variant="primary">
          Return to Pantry Shop
        </Button>
      </div>
    );
  }

  // Normalize variants
  const variants =
    product.variants && product.variants.length > 0
      ? product.variants
      : [
          {
            _id: product._id,
            label: product.weight || '100g',
            price: product.price || 249,
            mrp: product.originalPrice || 299,
            stock: product.stock ?? 50,
          },
        ];

  const currentVariant = variants[selectedVariantIndex] || variants[0];
  const price = currentVariant.price;
  const mrp = currentVariant.mrp || product.originalPrice || Math.round(price * 1.25);
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;
  const inStock = (currentVariant.stock ?? 1) > 0;
  const maxAvailable = Math.min(10, currentVariant.stock ?? 10);

  // Normalize images
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.map((img) => (typeof img === 'string' ? img : img.url))
      : [product.image || '/assets/products/Apple_Slices_Natural_Goodness_Label.webp'];

  const categoryName =
    typeof product.category === 'object'
      ? product.category?.name || product.category?.slug
      : product.category || 'Pantry';

  const categorySlug =
    typeof product.category === 'object'
      ? product.category?.slug
      : product.category;

  const accentColor = product.accentColor || '#1F6B3A';

  // 4 Core Highlights
  const defaultHighlights = [
    '100% Raw produce gently dried with warm air convection',
    'Preserves dietary fibers, natural enzymes, and raw vitamins',
    'Zero added preservatives, zero trans-fats, zero refined sugar',
    'Packaged in an air-tight resealable moisture-barrier pouch',
  ];
  const highlights =
    product.highlights && product.highlights.length > 0
      ? product.highlights.slice(0, 4)
      : defaultHighlights;

  // Actions
  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart(product, currentVariant, quantity, isAuthenticated);
  };

  const handleBuyNow = () => {
    if (!inStock) return;

    setBuyNowItem({
      productId: product._id,
      variantId: currentVariant._id,
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        image: images[0],
        price: currentVariant.price,
      },
      variantLabel: currentVariant.label,
      price: currentVariant.price,
      quantity,
      lineTotal: currentVariant.price * quantity,
    });

    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent('/checkout?mode=buy_now')}`);
    } else {
      navigate('/checkout?mode=buy_now');
    }
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: images[0],
    description: product.shortDescription || product.description?.slice(0, 200),
    brand: {
      '@type': 'Brand',
      name: 'FynDry',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: currentVariant?.price || 0,
      availability:
        currentVariant?.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 font-body">
      <SEO
        title={`${product.name} - ${product.tagline || 'Naturally Preserved'}`}
        description={product.shortDescription || product.description?.slice(0, 160)}
        keywords={`${product.name}, dehydrated fruits, dried fruit snacks, ${product.tags?.join(', ') || ''}`}
        canonical={`https://fyndry.com/product/${product.slug}`}
        ogImage={images[0]}
        ogType="product"
        schema={productSchema}
      />

      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        <Link to="/shop" className="hover:text-primary transition-colors">
          Shop
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        {categorySlug && (
          <>
            <Link
              to={`/shop?category=${categorySlug}`}
              className="hover:text-primary transition-colors capitalize"
            >
              {categoryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          </>
        )}
        <span className="text-gray-900 font-bold truncate max-w-[200px] sm:max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* 2. Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        {/* Left Column: Image Gallery with Interactive Zoom */}
        <div className="lg:col-span-6 space-y-4">
          <div
            ref={imageContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative aspect-square w-full rounded-3xl bg-white border border-gray-100 p-6 sm:p-10 flex items-center justify-center shadow-soft overflow-hidden group cursor-crosshair"
          >
            {discountPercent && (
              <span className="absolute top-5 left-5 z-10 px-3 py-1 rounded-full bg-brandRed text-white font-bold text-xs shadow-soft uppercase tracking-wider">
                {discountPercent}% OFF
              </span>
            )}

            <div className="absolute top-5 right-5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-cream/80 backdrop-blur-xs text-[11px] font-bold text-gray-600 border border-cream-dark">
              <ZoomIn className="w-3.5 h-3.5 text-primary" />
              <span>Hover to Zoom</span>
            </div>

            {/* Standard Image View */}
            <motion.img
              key={activeImageIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              src={images[activeImageIndex]}
              alt={product.name}
              className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            />

            {/* Magnifier Lens Zoom Layer */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-200 bg-no-repeat rounded-3xl z-20"
              style={{
                ...zoomStyle,
                backgroundImage: `url(${images[activeImageIndex]})`,
                backgroundSize: '240%',
                backgroundColor: 'white',
              }}
            />
          </div>

          {/* Gallery Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl bg-white p-2 border transition-all flex items-center justify-center shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-primary ring-2 ring-primary/20 shadow-soft scale-102'
                      : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Specifications & Purchasing Controls */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            {/* Category Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-primary-100 text-primary">
                <Tag className="w-3.5 h-3.5" />
                {categoryName}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-3xl sm:text-4xl font-heading font-black text-gray-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Tagline in Accent Color */}
            {product.tagline && (
              <p
                className="mt-1.5 text-base sm:text-lg font-heading font-bold"
                style={{ color: accentColor }}
              >
                {product.tagline}
              </p>
            )}

            {/* Price Section */}
            <div className="flex items-baseline gap-3 my-5">
              <span className="text-3xl sm:text-4xl font-heading font-black text-gray-900">
                ₹{price}
              </span>
              {mrp > price && (
                <span className="text-lg text-gray-400 line-through">₹{mrp}</span>
              )}
              {discountPercent && (
                <span className="text-xs font-bold text-brandRed bg-brandRed/10 px-2.5 py-0.5 rounded-full">
                  Save {discountPercent}%
                </span>
              )}
              <span className="text-xs text-gray-400 font-medium">(Taxes Included)</span>
            </div>

            {/* Short Description */}
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {product.shortDescription || product.description}
            </p>

            {/* Variant (Weight) Selector */}
            {variants.length > 1 && (
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                  Select Weight / Pack Size:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {variants.map((v, idx) => {
                    const isSelected = selectedVariantIndex === idx;
                    return (
                      <button
                        key={v._id || idx}
                        type="button"
                        onClick={() => setSelectedVariantIndex(idx)}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-2 ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-soft'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-primary/40'
                        }`}
                      >
                        <span>{v.label}</span>
                        <span className={`text-[11px] ${isSelected ? 'text-cream' : 'text-primary'}`}>
                          ₹{v.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Stock Status */}
            <div className="flex items-center gap-6 mb-8">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Quantity:
                </label>
                <div className="flex items-center border border-gray-200 bg-white rounded-2xl p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || !inStock}
                    className="p-1.5 rounded-xl hover:bg-cream text-gray-600 disabled:opacity-40 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-gray-800">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(maxAvailable, quantity + 1))}
                    disabled={quantity >= maxAvailable || !inStock}
                    className="p-1.5 rounded-xl hover:bg-cream text-gray-600 disabled:opacity-40 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Stock Status:
                </label>
                {inStock ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>In Stock (Ready to dispatch)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brandRed bg-brandRed/10 px-3 py-1.5 rounded-xl border border-brandRed/20">
                    <span>Temporarily Out of Stock</span>
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <Button
                variant="outline"
                size="lg"
                disabled={!inStock}
                onClick={handleAddToCart}
                icon={ShoppingBag}
                iconPosition="left"
              >
                {inStock ? 'Add to Basket' : 'Out of Stock'}
              </Button>

              <Button
                variant="primary"
                size="lg"
                disabled={!inStock}
                onClick={handleBuyNow}
                icon={Zap}
                iconPosition="left"
              >
                Buy Now
              </Button>
            </div>

            {/* 4 Animated Highlights Checklist */}
            <div className="border-t border-gray-100 pt-6 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Why You Will Love This:
              </h4>
              <ul className="space-y-2.5">
                {highlights.map((h, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 font-medium"
                  >
                    <CheckCircle
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: accentColor }}
                    />
                    <span>{h}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Value Guarantees */}
            <div className="border-t border-gray-100 pt-6 grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <Truck className="w-5 h-5 text-primary mb-1" />
                <span className="text-[11px] font-bold text-gray-800">Fast Express Delivery</span>
                <span className="text-[10px] text-gray-500">Free over ₹499</span>
              </div>
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-5 h-5 text-primary mb-1" />
                <span className="text-[11px] font-bold text-gray-800">100% Raw Ingredients</span>
                <span className="text-[10px] text-gray-500">Zero additives</span>
              </div>
              <div className="flex flex-col items-center">
                <PackageCheck className="w-5 h-5 text-primary mb-1" />
                <span className="text-[11px] font-bold text-gray-800">Resealable Pouch</span>
                <span className="text-[10px] text-gray-500">Locks natural crunch</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Information Tabs: Description, Ingredients, Storage */}
      <div className="mt-16 bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-soft">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={`pb-2 px-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'description'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Description & Usage
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ingredients')}
            className={`pb-2 px-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'ingredients'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Ingredients & Nutrition
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`pb-2 px-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'storage'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Storage & Shelf Life
          </button>
        </div>

        <div className="text-sm text-gray-600 leading-relaxed min-h-[120px]">
          {activeTab === 'description' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <p>{product.description || product.shortDescription}</p>
              {product.servingSuggestions && (
                <div className="mt-4 p-4 rounded-2xl bg-cream/50 border border-cream-dark">
                  <span className="font-bold text-gray-900 block mb-1">Serving Suggestions:</span>
                  <p className="text-xs text-gray-600">{product.servingSuggestions}</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'ingredients' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <span className="font-bold text-gray-900 block mb-1">Pure Ingredients:</span>
                <p>{product.ingredients || `100% Natural Dehydrated ${product.name}. No added salt, sugar, oil, or preservatives.`}</p>
              </div>
              {product.nutritionHighlights && product.nutritionHighlights.length > 0 && (
                <div>
                  <span className="font-bold text-gray-900 block mb-2">Nutritional Values per 100g:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.nutritionHighlights.map((nh, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-100">
                        {nh}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'storage' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <p>
                {product.storageInstructions ||
                  'Store in a cool, dry place away from direct sunlight and ambient humidity. Once unsealed, keep zipper securely closed or transfer to an airtight glass container.'}
              </p>
              {product.shelfLife && (
                <div className="inline-block px-3 py-1.5 rounded-xl bg-primary-50 text-primary font-bold text-xs">
                  Shelf Life: {product.shelfLife}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* 4. Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Handpicked Pairings
              </span>
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-gray-900">
                You May Also Like
              </h3>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-primary hover:underline"
            >
              View Full Range
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id || rel.slug} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* 5. Sticky Mobile Buy Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md p-3 border-t border-gray-200 md:hidden flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-2.5">
          <img
            src={images[0]}
            alt=""
            className="w-10 h-10 object-contain rounded-lg bg-cream-dark/40 p-1"
          />
          <div>
            <span className="font-heading font-black text-primary text-base block leading-tight">
              ₹{price * quantity}
            </span>
            <span className="text-[10px] text-gray-500 font-bold block leading-none">
              {currentVariant.label} • Qty {quantity}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className="px-3 py-2 rounded-xl text-xs font-bold text-primary bg-primary-50 hover:bg-primary-100 border border-primary/20 disabled:opacity-40"
          >
            Add
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!inStock}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm disabled:opacity-40"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
