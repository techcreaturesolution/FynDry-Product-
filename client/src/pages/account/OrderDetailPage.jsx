import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Clock,
  Printer,
  Download,
  ExternalLink,
  ShoppingBag,
  X,
} from 'lucide-react';
import orderApi from '../../api/orderApi';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const statusBadgeVariants = {
  placed: 'info',
  confirmed: 'primary',
  packed: 'warning',
  shipped: 'purple',
  out_for_delivery: 'purple',
  delivered: 'success',
  cancelled: 'danger',
  returned: 'default',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getOrderById(id);
      const data = res.data?.order || res.data;
      setOrder(data);
      if (data?.orderNumber) {
        document.title = `Order #${data.orderNumber} | FynDry`;
      }
    } catch (err) {
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please specify a cancellation reason');
      return;
    }

    setCancelling(true);
    try {
      await orderApi.cancelOrder(order._id, cancelReason.trim());
      toast.success('Order cancelled. Any payment made will be refunded within 5-7 business days.');
      setCancelModalOpen(false);
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  // Reorder functionality
  const handleReorder = () => {
    if (!order?.items || order.items.length === 0) return;

    order.items.forEach((it) => {
      addToCart(
        {
          _id: it.product?._id || it.product,
          name: it.name,
          image: it.image,
          price: it.price,
        },
        {
          _id: it.variantId,
          label: it.variantLabel || '100g',
          price: it.price,
        },
        it.quantity || 1,
        isAuthenticated
      );
    });

    toast.success('All items added to your basket!');
    navigate('/cart');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center font-body min-h-[50vh]">
        <Spinner size="lg" />
        <p className="mt-4 text-xs font-bold text-gray-500">Loading order records...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center font-body">
        <p className="text-sm font-bold text-gray-700">Order record not found.</p>
        <Link to="/account/orders" className="text-xs font-bold text-primary underline mt-2 block">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const isCancellable = ['placed', 'confirmed', 'packed'].includes(order.orderStatus);
  const formattedDate = new Date(order.createdAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6 font-body">
      {/* Back link & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order History</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setInvoiceModalOpen(true)}
            icon={Printer}
            iconPosition="left"
          >
            Print Invoice
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleReorder}
            icon={RotateCcw}
            iconPosition="left"
          >
            Reorder All
          </Button>
        </div>
      </div>

      {/* Main Order Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft space-y-6">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading font-black text-2xl text-gray-900">
                Order #{order.orderNumber || order._id}
              </h2>
              <Badge variant={statusBadgeVariants[order.orderStatus] || 'default'}>
                {order.orderStatus?.replace(/_/g, ' ')}
              </Badge>
              <Badge variant={order.payment?.status === 'paid' ? 'success' : 'warning'}>
                Payment: {order.payment?.status}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Placed on {formattedDate}</span>
              <span>•</span>
              <span className="capitalize">Source: {order.source || 'Online Store'}</span>
            </p>
          </div>

          {/* Cancellation CTA */}
          {isCancellable && (
            <button
              type="button"
              onClick={() => setCancelModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-brandRed hover:bg-red-50 border border-red-200 transition-colors self-start sm:self-auto"
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Courier Tracking Banner (if available) */}
        {order.trackingId && (
          <div className="p-4 rounded-2xl bg-primary-50 border border-primary-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-primary-900">
                  Shipped via {order.courierName || 'Express Courier'}
                </p>
                <p className="text-primary-700">
                  Tracking AWB / ID: <span className="font-mono font-bold">{order.trackingId}</span>
                </p>
              </div>
            </div>

            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
              >
                <span>Live Courier Tracking</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Cancellation Notice (if cancelled) */}
        {order.orderStatus === 'cancelled' && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-brandRed flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">This order was cancelled on {order.cancelledAt ? new Date(order.cancelledAt).toLocaleDateString() : 'recent'}.</p>
              {order.cancelReason && <p className="mt-0.5">Reason: {order.cancelReason}</p>}
            </div>
          </div>
        )}

        {/* Order Items Listing */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Purchased Natural Items ({order.items?.length || 0})
          </h4>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {order.items?.map((it, idx) => (
              <div
                key={idx}
                className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={it.image || '/assets/products/Apple_Slices_Natural_Goodness_Label.webp'}
                    alt={it.name}
                    className="w-14 h-14 object-contain rounded-xl bg-cream-dark/30 p-1 shrink-0"
                  />
                  <div>
                    <h5 className="font-heading font-bold text-sm text-gray-900">
                      {it.name}
                    </h5>
                    <p className="text-gray-500 mt-0.5">
                      Pack Size: <span className="font-bold text-gray-700">{it.variantLabel || '100g'}</span>
                    </p>
                    <p className="text-gray-500">
                      ₹{it.price} × {it.quantity}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-heading font-black text-base text-gray-900">
                    ₹{it.lineTotal || it.price * it.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column: Shipping Address & Payment Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
          {/* Shipping Address */}
          <div className="p-5 rounded-2xl bg-cream/30 border border-gray-100 space-y-2 text-xs">
            <h4 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Delivery Address Snapshot</span>
            </h4>
            {order.shippingAddress ? (
              <div className="text-gray-600 space-y-0.5">
                <p className="font-bold text-gray-900 text-sm">
                  {order.shippingAddress.fullName}
                </p>
                <p>
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
                </p>
                {order.shippingAddress.landmark && (
                  <p className="italic text-gray-500">Landmark: {order.shippingAddress.landmark}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} —{' '}
                  <span className="font-bold text-gray-900">{order.shippingAddress.pincode}</span>
                </p>
                <p className="pt-1 text-gray-500 font-semibold">Phone: {order.shippingAddress.phone}</p>
              </div>
            ) : (
              <p className="text-gray-400">Address record archived.</p>
            )}
          </div>

          {/* Payment & Invoice Breakdown */}
          <div className="p-5 rounded-2xl bg-cream/30 border border-gray-100 space-y-2 text-xs">
            <h4 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Payment & Charges</span>
            </h4>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-gray-600">
                <span>Payment Method</span>
                <span className="font-bold uppercase text-gray-900">
                  {order.paymentMethod || 'Razorpay'}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Payment Status</span>
                <Badge variant={order.payment?.status === 'paid' ? 'success' : 'warning'}>
                  {order.payment?.status}
                </Badge>
              </div>

              {order.payment?.razorpayPaymentId && (
                <div className="flex justify-between text-gray-600">
                  <span>Razorpay Payment ID</span>
                  <span className="font-mono text-[11px] text-gray-800">
                    {order.payment.razorpayPaymentId}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-200/60 pt-2 space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-gray-900">₹{order.pricing?.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-gray-900">
                    {order.pricing?.shippingFee === 0 ? 'FREE' : `₹${order.pricing?.shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200/60">
                  <span>Total Amount Paid</span>
                  <span className="text-lg font-black text-primary">₹{order.pricing?.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status History Timeline */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-4">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Order Fulfillment Timeline</span>
            </h4>
            <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {order.statusHistory.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3.5 text-xs relative pl-6">
                  <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px] font-bold absolute left-0.5 top-0.5 shadow-xs">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 uppercase">
                      {step.status?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-gray-400 ml-2">
                      {new Date(step.at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {step.note && <p className="text-gray-600 mt-0.5">{step.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Dialog Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <h3 className="text-xl font-heading font-black text-gray-900 mb-2">
              Cancel Order
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Are you sure you want to cancel this order? If you paid online via Razorpay, a full
              refund will be processed to your original payment method.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Reason for cancellation:
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Ordered wrong pack size, want to change address..."
                className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Keep Order
              </button>
              <Button
                variant="danger"
                size="sm"
                loading={cancelling}
                onClick={handleCancelOrder}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 font-body print:border-none print:shadow-none print:max-h-none print:p-0">
            {/* Invoice Top Actions */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100 print:hidden">
              <span className="font-heading font-black text-lg text-gray-900">
                Tax Invoice Preview
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handlePrintInvoice}
                  icon={Printer}
                  iconPosition="left"
                >
                  Print / Save as PDF
                </Button>
                <button
                  type="button"
                  onClick={() => setInvoiceModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Document */}
            <div className="pt-6 space-y-6 text-xs text-gray-700" id="printable-invoice">
              {/* Invoice Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="font-heading font-black text-2xl text-primary">FynDry</h1>
                  <p className="text-gray-500 font-bold">Goodness, Naturally Preserved</p>
                  <p className="text-[11px] text-gray-400 mt-1">FynDry Natural Foods Pvt. Ltd.</p>
                  <p className="text-[11px] text-gray-400">GSTIN: 29AABCF1234F1Z5</p>
                </div>
                <div className="text-right">
                  <h2 className="font-heading font-bold text-lg text-gray-900">TAX INVOICE</h2>
                  <p className="font-mono font-bold text-gray-800">#{order.orderNumber}</p>
                  <p className="text-gray-500 mt-1">Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              {/* Bill to & Ship to */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-cream/30 border border-gray-100">
                <div>
                  <span className="font-bold text-gray-900 block mb-1 uppercase tracking-wider text-[10px]">
                    Billed To:
                  </span>
                  <p className="font-bold text-gray-800">{order.shippingAddress?.fullName}</p>
                  <p>{order.shippingAddress?.addressLine1}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}</p>
                  <p>Contact: {order.shippingAddress?.phone}</p>
                </div>
                <div>
                  <span className="font-bold text-gray-900 block mb-1 uppercase tracking-wider text-[10px]">
                    Payment Details:
                  </span>
                  <p>Method: <strong className="uppercase">{order.paymentMethod || 'Online'}</strong></p>
                  <p>Status: <strong className="uppercase">{order.payment?.status}</strong></p>
                  {order.payment?.razorpayPaymentId && (
                    <p>Ref: <span className="font-mono">{order.payment.razorpayPaymentId}</span></p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-gray-500 text-[11px] uppercase text-left">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Pack</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-bold text-gray-900">{it.name}</td>
                      <td className="py-2.5 text-center text-gray-600">{it.variantLabel || '100g'}</td>
                      <td className="py-2.5 text-center text-gray-600">{it.quantity}</td>
                      <td className="py-2.5 text-right text-gray-600">₹{it.price}</td>
                      <td className="py-2.5 text-right font-bold text-gray-900">
                        ₹{it.lineTotal || it.price * it.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Breakdown */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-right pt-2 border-t-2 border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>₹{order.pricing?.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Charges:</span>
                    <span>{order.pricing?.shippingFee === 0 ? 'FREE' : `₹${order.pricing?.shippingFee}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST (Included):</span>
                    <span>₹{Math.round((order.pricing?.subtotal || 0) * 0.05)}</span>
                  </div>
                  <div className="flex justify-between font-heading font-black text-base text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total Amount:</span>
                    <span>₹{order.pricing?.total}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-8 border-t border-gray-100 text-[10px] text-gray-400">
                <p>This is a computer-generated tax invoice. No signature required.</p>
                <p>FynDry – Pure dehydrated produce. Preserving vitamins & taste naturally.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
