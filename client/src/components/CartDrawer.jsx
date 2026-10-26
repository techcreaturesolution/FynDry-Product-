import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import { getProductAssets } from '../utils/productImages';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { isCartOpen, closeCart, items, updateQuantity, removeItem, getSubtotal } =
    useCartStore();
  const { isAuthenticated } = useAuthStore();

  const subtotal = typeof getSubtotal === 'function' ? getSubtotal() : 0;
  const freeShippingThreshold = 499;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent('/checkout')}`);
    } else {
      navigate('/checkout');
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-cream shadow-2xl flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-cream-dark/60 bg-white/70 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary-100 text-primary flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-xl text-gray-900">Your Basket</h2>
                    <p className="text-xs text-gray-500 font-body">
                      {items.length} {items.length === 1 ? 'item' : 'items'} selected
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeCart}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-cream-dark/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Meter */}
              <div className="px-6 py-3 bg-primary-50 border-b border-primary-100 flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-primary-900">
                    {subtotal >= freeShippingThreshold ? (
                      <span className="text-primary font-bold">🎉 You qualify for FREE Delivery!</span>
                    ) : (
                      <>Add <span className="font-bold">₹{amountNeeded}</span> more for Free Delivery</>
                    )}
                  </p>
                  <div className="w-full bg-primary-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progressToFreeShipping}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-cream-dark flex items-center justify-center text-woodBrown mb-4">
                      <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <h3 className="font-heading font-bold text-xl text-gray-800">Your basket is empty</h3>
                    <p className="text-sm text-gray-500 max-w-xs mt-1 mb-6">
                      Explore our gently dehydrated orchard fruits, hearty soups, and pure root powders.
                    </p>
                    <button
                      onClick={() => {
                        closeCart();
                        navigate('/shop');
                      }}
                      className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full font-heading font-bold text-sm shadow-md transition-all active:scale-95"
                    >
                      Explore Products
                    </button>
                  </div>
                ) : (
                  items.map((item, index) => {
                    const product = item.product || item || {};
                    const productId = item.productId || product._id || product.id || item._id;
                    const itemKey = item._id || `${productId}_${item.variantId || index}`;
                    const assets = getProductAssets(product);
                    const itemImage =
                      assets?.image ||
                      product.image ||
                      (Array.isArray(product.images) && product.images[0]?.url) ||
                      '/assets/products/Apple_Slices_Natural_Goodness_Label.webp';
                    const itemFallback = assets?.imageFallback || product.imageFallback;
                    const unitPrice = item.price || product.price || 249;
                    const lineTotal = item.lineTotal || unitPrice * (item.quantity || 1);

                    return (
                      <div
                        key={itemKey}
                        className="flex gap-4 p-3.5 bg-white rounded-2xl border border-cream-dark shadow-soft"
                      >
                        <img
                          src={itemImage}
                          alt={product.name || 'Product'}
                          className="w-20 h-20 object-contain rounded-xl bg-cream-dark/30 p-1 shrink-0"
                          onError={(e) => {
                            if (itemFallback && e.currentTarget.src !== itemFallback) {
                              e.currentTarget.src = itemFallback;
                            }
                          }}
                        />

                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-heading font-bold text-gray-900 text-sm">
                                {product.name || 'FynDry Product'}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {item.variantLabel || product.weight || '100g'}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item._id || productId, isAuthenticated)}
                              className="text-gray-400 hover:text-brandRed p-1 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-cream-light">
                              <button
                                onClick={() =>
                                  updateQuantity(item._id || productId, item.quantity - 1, isAuthenticated)
                                }
                                className="p-1 hover:bg-cream-dark text-gray-600 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2.5 text-xs font-bold text-gray-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item._id || productId, item.quantity + 1, isAuthenticated)
                                }
                                className="p-1 hover:bg-cream-dark text-gray-600 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="text-right">
                              <span className="font-heading font-extrabold text-primary text-base">
                                ₹{lineTotal}
                              </span>
                              {product.originalPrice && (
                                <span className="block text-[10px] text-gray-400 line-through">
                                  ₹{product.originalPrice * item.quantity}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer / Checkout CTA */}
              {items.length > 0 && (
                <div className="p-6 bg-white border-t border-cream-dark space-y-4">
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-900">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery</span>
                      <span className="font-semibold text-primary">
                        {subtotal >= freeShippingThreshold ? 'FREE' : '₹49'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                      <span className="font-heading font-bold text-base text-gray-900">
                        Total Amount
                      </span>
                      <span className="font-heading font-black text-xl text-primary">
                        ₹{subtotal + (subtotal >= freeShippingThreshold ? 0 : 49)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-3.5 px-6 bg-primary hover:bg-primary-dark text-white rounded-2xl font-heading font-bold text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      closeCart();
                      navigate('/cart');
                    }}
                    className="w-full py-1.5 text-center text-xs font-bold text-gray-500 hover:text-primary transition-colors block"
                  >
                    View Full Cart & Summary
                  </button>

                  <p className="text-[11px] text-center text-gray-400">
                    Taxes calculated at checkout • Secure 256-bit encrypted Razorpay
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
