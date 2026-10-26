import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Package,
  ArrowRight,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  Sparkles,
} from 'lucide-react';
import orderApi from '../api/orderApi';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1F6B3A', '#A3260F', '#F2B705', '#8B5A2B'],
    });

    const fetchOrder = async () => {
      try {
        const res = await orderApi.getOrderById(id);
        setOrder(res.data);
      } catch (err) {
        console.error('Could not load order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-cream">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-6 sm:p-10 shadow-soft border border-gray-100 text-center"
      >
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-primary-100 text-primary mx-auto flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 stroke-[2.5]" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Order Successfully Placed
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-900 mt-1 mb-2">
          Thank you for choosing Goodness!
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-6">
          Your order #{order?.orderNumber || id} has been confirmed and our farm kitchen is gently
          packing your pure harvest.
        </p>

        {/* Order Info Card */}
        {order && (
          <div className="text-left bg-cream rounded-2xl p-5 sm:p-6 border border-cream-dark mb-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-200">
              <div>
                <span className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">
                  Order ID
                </span>
                <p className="font-heading font-extrabold text-gray-900 text-base">
                  {order.orderNumber}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">
                  Payment Status
                </span>
                <p>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      order.isPaid
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.isPaid ? 'Paid via Razorpay' : 'Pending (Cash on Delivery)'}
                  </span>
                </p>
              </div>
            </div>

            {/* Address */}
            <div>
              <span className="text-[11px] text-gray-500 uppercase font-bold tracking-wider block mb-1">
                Delivering To
              </span>
              <p className="text-xs font-bold text-gray-800">
                {order.shippingAddress.fullName} ({order.shippingAddress.phone})
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {order.shippingAddress.street}
                {order.shippingAddress.landmark ? `, ${order.shippingAddress.landmark}` : ''},{' '}
                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                {order.shippingAddress.postalCode}
              </p>
            </div>

            {/* Items */}
            <div className="pt-3 border-t border-gray-200">
              <span className="text-[11px] text-gray-500 uppercase font-bold tracking-wider block mb-2">
                Order Items ({order.orderItems?.length})
              </span>
              <div className="space-y-2">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-gray-700 font-medium">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-bold text-gray-900">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="font-heading font-bold text-sm text-gray-900">Total Amount</span>
              <span className="font-heading font-black text-xl text-primary">
                ₹{order.totalPrice}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/orders"
            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-heading font-bold text-sm shadow-md transition-all active:scale-95"
          >
            Track in My Orders
          </Link>
          <Link
            to="/shop"
            className="w-full sm:w-auto px-6 py-3 bg-cream hover:bg-cream-dark text-gray-800 border border-cream-dark rounded-xl font-heading font-bold text-sm transition-all"
          >
            Explore More Products
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
