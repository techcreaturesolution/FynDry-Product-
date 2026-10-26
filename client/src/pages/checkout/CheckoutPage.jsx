import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
  Check,
  Plus,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import addressApi from '../../api/addressApi';
import orderApi from '../../api/orderApi';
import AddressModal from '../../components/AddressModal';
import AddressCard from '../../components/common/AddressCard';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

// Helper to dynamically load Razorpay checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isBuyNowMode = searchParams.get('mode') === 'buy_now';

  const { user } = useAuthStore();
  const { items, buyNowItem, clearBuyNowItem, clearCart } = useCartStore();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  useEffect(() => {
    document.title = 'Secure Checkout | FynDry';
  }, []);

  // Determine items to checkout: direct Buy Now or user's cart
  const checkoutItems = isBuyNowMode && buyNowItem ? [buyNowItem] : (buyNowItem ? [buyNowItem] : items);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await addressApi.getAddresses();
      const list = Array.isArray(res.data) ? res.data : (res.data?.addresses || []);
      setAddresses(list);

      // Pre-select default address if available
      if (list.length > 0 && !selectedAddressId) {
        const defaultAddr = list.find((a) => a.isDefault) || list[0];
        setSelectedAddressId(defaultAddr._id);
      }
    } catch (err) {
      console.warn('Could not load delivery addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Empty checkout guard
  if (!checkoutItems || checkoutItems.length === 0) {
    return (
      <div className="py-24 max-w-lg mx-auto px-4 text-center font-body min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-cream-dark flex items-center justify-center text-primary mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-black text-2xl text-gray-900 mb-2">
          Your Basket is Empty
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          There are no products selected for checkout. Please browse our natural pantry.
        </p>
        <Button href="/shop" variant="primary">
          Explore Natural Products
        </Button>
      </div>
    );
  }

  // Calculate pricing breakdown
  const subtotal = checkoutItems.reduce((acc, item) => {
    const p = item.price || item.product?.price || 0;
    return acc + p * (item.quantity || 1);
  }, 0);

  const freeShippingThreshold = 499;
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;
  const shippingFee = qualifiesForFreeShipping || subtotal === 0 ? 0 : 49;
  const totalAmount = subtotal + shippingFee;

  // Handle adding new address and auto-selecting it
  const handleSaveNewAddress = async (payload) => {
    try {
      const res = await addressApi.createAddress(payload);
      const newAddr = res.data?.address || res.data;
      toast.success('Address saved and selected!');
      setIsAddressModalOpen(false);

      // Refresh list & select newly created address
      await fetchAddresses();
      if (newAddr && newAddr._id) {
        setSelectedAddressId(newAddr._id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    }
  };

  // Main Checkout Submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorNotice(null);

    if (!selectedAddressId) {
      toast.error('Please select or add a delivery address to proceed.');
      return;
    }

    setIsProcessing(true);

    try {
      const isDirectBuyNow = isBuyNowMode || !!buyNowItem;
      const payload = {
        source: isDirectBuyNow ? 'buy_now' : 'cart',
        items: isDirectBuyNow
          ? [
              {
                productId: buyNowItem.productId || buyNowItem.product?._id || buyNowItem.product?.id,
                variantId: buyNowItem.variantId,
                quantity: buyNowItem.quantity || 1,
              },
            ]
          : undefined,
        addressId: selectedAddressId,
        paymentMethod,
      };

      const checkoutResponse = await orderApi.checkout(payload);
      const checkoutData = checkoutResponse.data;
      const order = checkoutData.order;
      const razorpayOrderId = checkoutData.razorpayOrderId;
      const razorpayKeyId = checkoutData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

      // Handle Cash on Delivery (COD)
      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully with Cash on Delivery!');
        if (isDirectBuyNow) {
          clearBuyNowItem();
        } else {
          await clearCart(true);
        }
        navigate(`/order-success/${order._id}`);
        return;
      }

      // Handle Razorpay Online Gateway
      const isSdkLoaded = await loadRazorpayScript();
      const isMockTest =
        !razorpayKeyId ||
        razorpayKeyId.includes('placeholder') ||
        !razorpayOrderId;

      // Automated Mock Test Fallback for local sandbox testing
      if (isMockTest || !isSdkLoaded) {
        toast('Processing test verification...', { icon: '💳' });
        const mockPaymentId = `pay_mock_${Date.now()}`;
        const mockSignature = 'sig_mock_verified';

        try {
          await orderApi.verifyPayment({
            razorpay_order_id: razorpayOrderId || `order_mock_${Date.now()}`,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: mockSignature,
          });

          if (isDirectBuyNow) {
            clearBuyNowItem();
          } else {
            await clearCart(true);
          }
          navigate(`/order-success/${order._id}`);
          return;
        } catch (vErr) {
          setErrorNotice('Payment verification failed. Please try again.');
          setIsProcessing(false);
          return;
        }
      }

      // Open Razorpay Checkout Modal
      const selectedAddr = addresses.find((a) => a._id === selectedAddressId);
      const options = {
        key: razorpayKeyId,
        amount: Math.round(order.pricing.total * 100),
        currency: 'INR',
        name: 'FynDry',
        description: `Order #${order.orderNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: selectedAddr?.fullName || user?.name || '',
          email: user?.email || '',
          contact: selectedAddr?.phone || user?.phone || '',
        },
        theme: {
          color: '#1F6B3A',
        },
        handler: async (response) => {
          try {
            await orderApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (isDirectBuyNow) {
              clearBuyNowItem();
            } else {
              await clearCart(true);
            }

            toast.success('Payment verified! Order confirmed.');
            navigate(`/order-success/${order._id}`);
          } catch (verifyErr) {
            setErrorNotice('Payment signature verification failed. Please contact support.');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: async () => {
            setIsProcessing(false);
            try {
              await orderApi.paymentFailed({
                razorpay_order_id: razorpayOrderId,
                orderId: order._id,
                reason: 'Customer cancelled payment popup',
              });
            } catch (failErr) {
              // ignore
            }
            toast.error('Payment was cancelled. You can retry anytime.');
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', async (response) => {
        setIsProcessing(false);
        try {
          await orderApi.paymentFailed({
            razorpay_order_id: razorpayOrderId,
            orderId: order._id,
            reason: response.error?.description || 'Gateway declined payment',
          });
        } catch (failErr) {
          // ignore
        }
        setErrorNotice(response.error?.description || 'Payment failed. Please retry with a valid card or UPI.');
      });

      rzpInstance.open();
    } catch (err) {
      setIsProcessing(false);
      const msg = err.response?.data?.message || err.message || 'Checkout could not be processed';
      setErrorNotice(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-body min-h-screen">
      {/* Checkout Header */}
      <div className="mb-8 border-b border-gray-100 pb-5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Encrypted 256-bit Checkout
        </span>
        <h1 className="text-3xl font-heading font-black text-gray-900 tracking-tight">
          Complete Your Order
        </h1>
        {isBuyNowMode && (
          <p className="text-xs font-bold text-accent-banana bg-primary/90 px-3 py-1 rounded-full inline-block mt-2 text-white">
            ⚡ Direct Buy Now Mode (Your main shopping cart remains untouched)
          </p>
        )}
      </div>

      {/* Error Notice Banner */}
      {errorNotice && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-brandRed flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorNotice(null)}
            className="text-xs underline hover:text-red-900 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Steps on Left, Order Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Step 1 (Address) + Step 2 (Review & Pay) */}
        <div className="lg:col-span-8 space-y-8">
          {/* STEP 1: Delivery Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white font-heading font-black text-sm flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-heading font-black text-gray-900">
                    Delivery Address
                  </h3>
                  <p className="text-xs text-gray-500">
                    Select where you would like your order delivered.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddressModalOpen(true)}
                icon={Plus}
                iconPosition="left"
                className="self-start sm:self-auto"
              >
                Add New Address
              </Button>
            </div>

            {/* Addresses Selection Grid */}
            {loadingAddresses && (
              <div className="py-12 flex justify-center">
                <Spinner size="md" />
              </div>
            )}

            {!loadingAddresses && addresses.length === 0 && (
              <div className="py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-cream-dark flex items-center justify-center mx-auto mb-3 text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-gray-900 text-sm mb-1">
                  No Saved Address Found
                </h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mb-4">
                  Please add a delivery address with live GPS coordinates to proceed.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddressModalOpen(true)}
                >
                  Add Address Now
                </Button>
              </div>
            )}

            {!loadingAddresses && addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {addresses.map((addr) => (
                  <AddressCard
                    key={addr._id}
                    address={addr}
                    selected={selectedAddressId === addr._id}
                    onSelect={(id) => setSelectedAddressId(id)}
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </div>

          {/* STEP 2: Review & Payment Method */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft">
            <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-primary text-white font-heading font-black text-sm flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h3 className="text-lg font-heading font-black text-gray-900">
                  Payment Method
                </h3>
                <p className="text-xs text-gray-500">
                  Choose your preferred payment method.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {/* Razorpay Option */}
              <div
                onClick={() => setPaymentMethod('razorpay')}
                className={`rounded-2xl p-4 border transition-all cursor-pointer flex items-start gap-3 ${
                  paymentMethod === 'razorpay'
                    ? 'border-primary bg-primary-50/40 ring-2 ring-primary/20 shadow-soft'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    paymentMethod === 'razorpay'
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {paymentMethod === 'razorpay' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-heading font-bold text-sm text-gray-900">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span>Razorpay Secure Online</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    UPI, Google Pay, PhonePe, Cards, NetBanking & Wallets
                  </p>
                </div>
              </div>

              {/* Cash On Delivery Option */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`rounded-2xl p-4 border transition-all cursor-pointer flex items-start gap-3 ${
                  paymentMethod === 'cod'
                    ? 'border-primary bg-primary-50/40 ring-2 ring-primary/20 shadow-soft'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    paymentMethod === 'cod'
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {paymentMethod === 'cod' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-heading font-bold text-sm text-gray-900">
                    <Truck className="w-4 h-4 text-woodBrown" />
                    <span>Cash on Delivery</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pay upon physical delivery at your doorstep
                  </p>
                </div>
              </div>
            </div>

            {/* Place Order CTA on Large Screens */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-gray-500">
                <span>By clicking Place Order, you agree to our natural food delivery terms.</span>
              </div>

              <Button
                type="button"
                variant="primary"
                size="lg"
                loading={isProcessing}
                disabled={!selectedAddressId}
                onClick={handlePlaceOrder}
                icon={ArrowRight}
                iconPosition="right"
                className="w-full sm:w-auto"
              >
                Place Order & Pay ₹{totalAmount}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (Sticky on Desktop, Collapsible on Mobile) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl sticky top-28 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-heading font-black text-gray-900">
                Order Summary ({checkoutItems.length} {checkoutItems.length === 1 ? 'item' : 'items'})
              </h3>

              {/* Mobile Collapse Toggle */}
              <button
                type="button"
                onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
                className="lg:hidden text-gray-500 p-1 rounded-lg hover:bg-gray-100"
              >
                {mobileSummaryOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {/* Items List (Always visible on desktop; collapsible on mobile) */}
            <div
              className={`space-y-3.5 overflow-y-auto max-h-72 pr-1 ${
                mobileSummaryOpen ? 'block' : 'hidden lg:block'
              }`}
            >
              {checkoutItems.map((item, idx) => {
                const product = item.product || item || {};
                const image =
                  (Array.isArray(product.images) && product.images[0]?.url) ||
                  product.image ||
                  '/assets/products/Apple_Slices_Natural_Goodness_Label.webp';
                const itemPrice = item.price || product.price || 249;
                const lineTotal = item.lineTotal || itemPrice * (item.quantity || 1);

                return (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <img
                      src={image}
                      alt={product.name}
                      className="w-12 h-12 object-contain rounded-xl bg-cream-dark/30 p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-bold text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {item.variantLabel || product.weight || '100g'} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-black text-gray-900 text-sm">
                      ₹{lineTotal}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Pricing Breakdown */}
            <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Express Delivery</span>
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
                  <span className="text-sm font-heading font-bold text-gray-900">Total Due</span>
                  <span className="block text-[10px] text-gray-400">All taxes included</span>
                </div>
                <span className="text-2xl font-heading font-black text-primary">
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            {/* Security Badges */}
            <div className="pt-3 border-t border-gray-100 text-center space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-600">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Zero Risk • Guaranteed Delivery</span>
              </div>
              <p className="text-[10px] text-gray-400">
                Processed via Razorpay’s PCI-DSS Level 1 certified gateway.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Address Form Modal with Leaflet GPS Location Picker */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveNewAddress}
      />
    </div>
  );
}
