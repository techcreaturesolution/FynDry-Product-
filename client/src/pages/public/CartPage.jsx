import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

export default function CartPage() {
  const { items, pricing, updateQuantity, removeItem, clearCart, getSubtotal } =
    useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Shopping Basket | FynDry';
  }, []);

  const subtotal =
    typeof getSubtotal === 'function'
      ? getSubtotal()
      : pricing?.subtotal || items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);

  const freeShippingThreshold = 499;
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;
  const shippingFee = qualifiesForFreeShipping || subtotal === 0 ? 0 : 49;
  const totalAmount = subtotal + shippingFee;

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent('/checkout')}`);
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 font-body">
        <EmptyState
          icon={ShoppingBag}
          title="Your Pantry Basket is Empty"
          description="You haven't added any dehydrated fruits, hearty soup mixes, or culinary root powders yet."
          actionText="Explore Natural Pantry"
          actionHref="/shop"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 font-body min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-gray-900 tracking-tight">
            Your Basket ({items.reduce((s, i) => s + (i.quantity || 1), 0)} items)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Carefully packaged in moisture-locking resealable pouches ready for fast dispatch.
          </p>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-auto">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={() => clearCart(isAuthenticated)}
            className="text-xs font-bold text-gray-400 hover:text-brandRed transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="my-6 bg-white rounded-2xl p-4 border border-gray-100 shadow-soft">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="flex items-center gap-2 text-primary font-heading">
            <Truck className="w-4 h-4 text-primary" />
            {amountNeeded > 0 ? (
              <>
                Add <span className="text-brandRed font-black">₹{amountNeeded}</span> more for FREE Express Delivery!
              </>
            ) : (
              '🎉 Congratulations! Your order qualifies for FREE Express Delivery!'
            )}
          </span>
          <span className="text-gray-500">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-cream overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Items on left, Summary on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const product = item.product || item || {};
            const productId = item.productId || product._id || product.id || item._id;
            const itemPrice = item.price || product.price || 249;
            const lineTotal = item.lineTotal || itemPrice * (item.quantity || 1);
            const image =
              (Array.isArray(product.images) && product.images[0]?.url) ||
              product.image ||
              '/assets/products/Apple_Slices_Natural_Goodness_Label.webp';

            // Stock alerts
            const availableStock = product.stock ?? 10;
            const isLowStock = availableStock > 0 && availableStock <= 5;
            const isOutOfStock = availableStock <= 0;

            return (
              <motion.div
                key={item._id || `${productId}_${item.variantId}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 rounded-2xl bg-cream-dark/30 p-2 shrink-0 flex items-center justify-center">
                    <img
                      src={image}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <Link
                      to={`/product/${product.slug}`}
                      className="text-base font-heading font-bold text-gray-900 hover:text-primary transition-colors block"
                    >
                      {product.name || 'FynDry Natural Product'}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Pack Size:{' '}
                      <span className="font-bold text-gray-700">
                        {item.variantLabel || product.weight || '100g'}
                      </span>
                    </p>
                    <p className="text-sm font-black text-gray-900 mt-1">
                      ₹{itemPrice} <span className="text-xs font-normal text-gray-400">each</span>
                    </p>

                    {/* Stock Warning Badge */}
                    {isLowStock && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1.5">
                        <AlertCircle className="w-3 h-3" />
                        Only {availableStock} left in stock!
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brandRed bg-brandRed/10 px-2 py-0.5 rounded-md mt-1.5">
                        <AlertCircle className="w-3 h-3" />
                        Item out of stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Stepper + Total + Delete */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                  <div className="flex items-center border border-gray-200 bg-cream/30 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item._id || productId, item.quantity - 1, isAuthenticated)
                      }
                      className="p-1.5 rounded-lg hover:bg-white text-gray-600 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item._id || productId, item.quantity + 1, isAuthenticated)
                      }
                      className="p-1.5 rounded-lg hover:bg-white text-gray-600 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <span className="text-base font-heading font-black text-gray-900">
                      ₹{lineTotal}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item._id || productId, isAuthenticated)}
                    className="p-2 rounded-xl text-gray-400 hover:text-brandRed hover:bg-red-50 transition-colors"
                    aria-label="Remove item"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xl space-y-4 sticky top-28">
            <h3 className="text-xl font-heading font-black text-gray-900 border-b border-gray-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Estimated Shipping</span>
                <span className="font-bold text-gray-900">
                  {qualifiesForFreeShipping ? (
                    <span className="text-primary font-bold">FREE</span>
                  ) : (
                    '₹49'
                  )}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-heading font-bold text-gray-900">
                    Grand Total
                  </span>
                  <span className="block text-[11px] text-gray-400">
                    Includes all GST & taxes
                  </span>
                </div>
                <span className="text-2xl font-heading font-black text-primary">
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            <Button
              onClick={handleProceedToCheckout}
              variant="primary"
              size="lg"
              className="w-full mt-4"
              icon={ArrowRight}
              iconPosition="right"
            >
              Proceed to Checkout
            </Button>

            {!isAuthenticated && (
              <p className="text-[11px] text-center text-amber-700 bg-amber-50 p-2 rounded-xl font-medium">
                You will be prompted to log in or register before confirming order.
              </p>
            )}

            <div className="pt-4 border-t border-gray-100 space-y-2 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-bold">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>100% Secure Razorpay & UPI Checkout</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Gentle dehydrating process retains nutrients for healthy snacking
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
