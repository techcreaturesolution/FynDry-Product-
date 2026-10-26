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
  ShoppingBag,
} from 'lucide-react';
import orderApi from '../../api/orderApi';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Order Confirmed! | FynDry';

    // Celebratory confetti burst
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#1F6B3A', '#A3260F', '#F2B705', '#8B5A2B'],
      });
    } catch (e) {
      // ignore
    }

    const fetchOrder = async () => {
      try {
        const res = await orderApi.getOrderById(id);
        setOrder(res.data?.order || res.data);
      } catch (err) {
        console.error('Could not load order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center font-body min-h-[60vh]">
        <Spinner size="lg" />
        <p className="mt-4 text-xs font-bold text-gray-500">Retrieving confirmed order record...</p>
      </div>
    );
  }

  const orderNumber = order?.orderNumber || `FD-${id?.substring(0, 8)}`;
  const total = order?.pricing?.total || 0;
  const items = order?.items || [];
  const shippingAddress = order?.shippingAddress;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 font-body">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-6 sm:p-10 shadow-soft border border-gray-100 text-center"
      >
        {/* Animated Success Badge */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xs">
          <CheckCircle className="w-10 h-10 stroke-[2.5]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Order Placed Successfully
        </span>

        <h1 className="text-3xl sm:text-4xl font-heading font-black text-gray-900 tracking-tight">
          Thank You For Choosing Natural!
        </h1>
        <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
          We’ve received your order and our packaging team is preparing your pure dehydrated goods for dispatch.
        </p>

        {/* Order Details Snapshot Card */}
        <div className="my-8 p-6 rounded-3xl bg-cream/30 border border-primary/10 max-w-lg mx-auto text-left space-y-4 text-xs">
          {/* Reference & Status */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-200/60">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                Order Reference
              </span>
              <span className="font-heading font-black text-lg text-gray-900">
                {orderNumber}
              </span>
            </div>
            <div className="text-right">
              <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                Payment Status
              </span>
              <span className="font-bold uppercase text-primary text-xs">
                {order?.payment?.status || 'Confirmed'}
              </span>
            </div>
          </div>

          {/* Purchased Items List */}
          {items.length > 0 && (
            <div className="space-y-2 py-1">
              <span className="text-gray-500 font-bold block text-[11px] uppercase tracking-wider">
                Items In This Order:
              </span>
              <div className="divide-y divide-gray-100">
                {items.map((it, idx) => (
                  <div key={idx} className="py-1.5 flex justify-between items-center text-xs">
                    <span className="text-gray-800 font-medium">
                      {it.name} ({it.variantLabel || '100g'}) × {it.quantity}
                    </span>
                    <span className="font-bold text-gray-900">
                      ₹{it.lineTotal || it.price * it.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Row */}
          <div className="pt-2 border-t border-gray-200/60 flex justify-between items-center">
            <span className="text-gray-600 font-bold">Total Amount Paid</span>
            <span className="font-heading font-black text-primary text-lg">
              ₹{total}
            </span>
          </div>

          {/* Shipping Address */}
          {shippingAddress && (
            <div className="pt-3 border-t border-gray-200/60 text-gray-600">
              <span className="text-gray-500 font-bold block text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Shipping Address:</span>
              </span>
              <p className="font-bold text-gray-900">{shippingAddress.fullName}</p>
              <p>
                {shippingAddress.addressLine1}
                {shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ''}
              </p>
              <p>
                {shippingAddress.city}, {shippingAddress.state} — {shippingAddress.pincode}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">Contact: {shippingAddress.phone}</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button href={`/account/orders/${order?._id || id}`} variant="outline" size="md">
            View Order Timeline
          </Button>

          <Button href="/shop" variant="primary" size="md" icon={ShoppingBag} iconPosition="left">
            Continue Shopping
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
