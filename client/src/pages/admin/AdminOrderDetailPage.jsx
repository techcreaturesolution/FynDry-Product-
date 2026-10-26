import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Truck,
  Package,
  MapPin,
  CreditCard,
  Clock,
  Send,
  User,
  ExternalLink,
  Printer,
  X,
  Leaf,
  CheckCircle,
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const allowedNextTransitions = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery', 'delivered', 'returned'],
  out_for_delivery: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Form states for status update
  const [nextStatus, setNextStatus] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [courierName, setCourierName] = useState('Delhivery');
  const [statusNote, setStatusNote] = useState('');

  const printAreaRef = useRef(null);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrderById(id);
      const doc = res.data?.order || res.data;
      setOrder(doc);
      setTrackingId(doc?.trackingId || '');
      setCourierName(doc?.courierName || 'Delhivery');
    } catch (err) {
      toast.error('Failed to load order record');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!nextStatus) {
      toast.error('Please select the next status transition');
      return;
    }

    if (nextStatus === 'shipped' && !trackingId.trim()) {
      toast.error('Please specify a Courier Tracking/Waybill ID');
      return;
    }

    setUpdating(true);
    try {
      await adminApi.updateOrderStatus(order._id, {
        status: nextStatus,
        note: statusNote.trim() || undefined,
        trackingId: trackingId.trim() || undefined,
        courierName: courierName.trim() || undefined,
      });

      toast.success(`Order transitioned to ${nextStatus}`);
      setNextStatus('');
      setStatusNote('');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status transition rejected');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center font-body">
        <Spinner size="lg" />
        <p className="mt-4 text-xs font-bold text-gray-500">Loading order document...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center font-body">
        <p className="text-sm font-bold text-gray-700">Order not found.</p>
        <Link to="/admin/orders" className="text-xs font-bold text-primary underline mt-2 block">
          Back to Orders List
        </Link>
      </div>
    );
  }

  const allowedStatuses = allowedNextTransitions[order.orderStatus] || [];

  // Coordinates extraction
  const coords =
    order.shippingAddress?.location?.coordinates ||
    order.shippingAddress?.coordinates;
  const hasCoordinates =
    Array.isArray(coords) &&
    coords.length === 2 &&
    coords[0] !== 0 &&
    coords[1] !== 0;
  const lng = hasCoordinates ? coords[0] : null;
  const lat = hasCoordinates ? coords[1] : null;
  const googleMapsUrl = hasCoordinates ? `https://www.google.com/maps?q=${lat},${lng}` : null;

  return (
    <div className="space-y-6 font-body">
      {/* Top Navigation & Print Trigger */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>

        <button
          type="button"
          onClick={() => setShowInvoiceModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-soft transition-colors"
        >
          <Printer className="w-4 h-4 text-primary" />
          <span>Print Invoice / Packing Slip</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-soft space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-heading font-black text-gray-900">
                {order.orderNumber}
              </h1>
              <Badge
                variant={
                  order.orderStatus === 'delivered'
                    ? 'success'
                    : order.orderStatus === 'cancelled'
                    ? 'danger'
                    : 'primary'
                }
              >
                {order.orderStatus}
              </Badge>
              <Badge
                variant={
                  order.payment?.status === 'paid'
                    ? 'success'
                    : order.payment?.status === 'refunded'
                    ? 'danger'
                    : 'warning'
                }
              >
                Payment: {order.payment?.status}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-2xl font-heading font-black text-primary">
              ₹{(order.pricing?.total || 0).toLocaleString('en-IN')}
            </span>
            <p className="text-xs text-gray-400 uppercase font-bold mt-0.5">
              {order.paymentMethod} Payment
            </p>
          </div>
        </div>

        {/* Status Transition Control Card */}
        <div className="p-6 rounded-3xl bg-cream/40 border border-primary/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-heading font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              <span>Advance Order Lifecycle Status</span>
            </h3>
            {order.trackingId && (
              <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded-xl border border-gray-200 text-gray-700">
                Courier: {order.courierName || 'Delhivery'} | Waybill: {order.trackingId}
              </span>
            )}
          </div>

          {allowedStatuses.length === 0 ? (
            <p className="text-xs text-gray-500">
              This order has reached terminal status (<strong>{order.orderStatus}</strong>). No further transitions allowed.
            </p>
          ) : (
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Next Status <span className="text-brandRed">*</span>
                  </label>
                  <select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                    className="w-full bg-white rounded-2xl px-3 py-2 text-xs font-bold border border-gray-200 focus:outline-none focus:border-primary cursor-pointer"
                    required
                  >
                    <option value="">Select transition...</option>
                    {allowedStatuses.map((st) => (
                      <option key={st} value={st}>
                        {st.replace(/_/g, ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {nextStatus === 'shipped' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Courier Name <span className="text-brandRed">*</span>
                      </label>
                      <input
                        type="text"
                        value={courierName}
                        onChange={(e) => setCourierName(e.target.value)}
                        placeholder="e.g. Delhivery, BlueDart"
                        className="w-full bg-white rounded-2xl px-3 py-2 text-xs border border-gray-200 focus:outline-none focus:border-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Tracking / Waybill ID <span className="text-brandRed">*</span>
                      </label>
                      <input
                        type="text"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        placeholder="e.g. DELHIVERY_998877"
                        className="w-full bg-white rounded-2xl px-3 py-2 text-xs border border-gray-200 focus:outline-none focus:border-primary font-mono"
                        required
                      />
                    </div>
                  </>
                )}

                <div className={nextStatus === 'shipped' ? 'sm:col-span-2 lg:col-span-1' : 'sm:col-span-2'}>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Status Note
                  </label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Optional note to customer or audit"
                    className="w-full bg-white rounded-2xl px-3 py-2 text-xs border border-gray-200 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={updating}
                  icon={Send}
                  iconPosition="right"
                >
                  Update & Record History
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* 3 Columns: Customer Info, Shipping Address, Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Customer */}
          <div className="p-5 rounded-3xl bg-gray-50 border border-gray-100 text-xs space-y-1.5">
            <h4 className="font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Customer Details</span>
            </h4>
            <p className="font-bold text-gray-900 text-sm">
              {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
            </p>
            <p className="text-gray-500">{order.user?.email}</p>
            <p className="text-gray-500">{order.shippingAddress?.phone || order.user?.phone}</p>
          </div>

          {/* Shipping Address with Open in Google Maps */}
          <div className="p-5 rounded-3xl bg-gray-50 border border-gray-100 text-xs space-y-1.5">
            <h4 className="font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Shipping Address</span>
            </h4>
            <p className="text-gray-800 leading-relaxed font-medium">
              {order.shippingAddress?.addressLine1}
              {order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress?.addressLine2}` : ''}
              {order.shippingAddress?.landmark ? ` (Near ${order.shippingAddress?.landmark})` : ''}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} —{' '}
              <span className="font-bold">{order.shippingAddress?.pincode}</span>
            </p>

            {/* Google Maps Link */}
            {hasCoordinates ? (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-xl bg-white border border-primary/30 text-primary text-[11px] font-bold hover:bg-primary-50 transition-colors shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Google Maps ({lat?.toFixed(4)}, {lng?.toFixed(4)})</span>
              </a>
            ) : (
              <p className="text-[10px] text-gray-400 pt-1">
                Standard address (No GPS pin attached)
              </p>
            )}
          </div>

          {/* Payment Info */}
          <div className="p-5 rounded-3xl bg-gray-50 border border-gray-100 text-xs space-y-1.5">
            <h4 className="font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              <span>Payment Details</span>
            </h4>
            <p className="text-gray-600">
              Method: <span className="font-bold uppercase text-gray-900">{order.paymentMethod}</span>
            </p>
            <p className="text-gray-600">
              Gateway Status: <span className="font-bold text-gray-900 capitalize">{order.payment?.status}</span>
            </p>
            {order.payment?.razorpayPaymentId && (
              <p className="text-[11px] text-gray-500 font-mono truncate">
                Razorpay ID: {order.payment.razorpayPaymentId}
              </p>
            )}
            {order.payment?.paidAt && (
              <p className="text-[11px] text-gray-400">
                Paid At: {new Date(order.payment.paidAt).toLocaleString('en-IN')}
              </p>
            )}
          </div>
        </div>

        {/* Itemized Snapshot */}
        <div>
          <h3 className="text-xs font-heading font-black text-gray-900 uppercase tracking-wider mb-3">
            Itemized Order Snapshot
          </h3>
          <div className="border border-gray-200 rounded-3xl overflow-hidden divide-y divide-gray-100">
            {order.items?.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cream/50 p-1 shrink-0 flex items-center justify-center border border-gray-100">
                    <img src={item.image} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                    <p className="text-gray-500">
                      Pack: <span className="font-bold">{item.variantLabel}</span> • Qty: {item.quantity}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-gray-400 text-[11px]">₹{item.price} each</p>
                  <p className="font-heading font-black text-sm text-primary">₹{item.lineTotal}</p>
                </div>
              </div>
            ))}

            {/* Pricing Summary Footer */}
            <div className="p-4 bg-gray-50/70 flex flex-col items-end text-xs space-y-1">
              <div className="flex justify-between w-48 text-gray-500">
                <span>Subtotal:</span>
                <span>₹{order.pricing?.subtotal || 0}</span>
              </div>
              <div className="flex justify-between w-48 text-gray-500">
                <span>Shipping:</span>
                <span>{order.pricing?.shippingFee === 0 ? 'FREE' : `₹${order.pricing?.shippingFee}`}</span>
              </div>
              {order.pricing?.tax > 0 && (
                <div className="flex justify-between w-48 text-gray-500">
                  <span>GST / Tax:</span>
                  <span>₹{order.pricing.tax}</span>
                </div>
              )}
              {order.pricing?.discount > 0 && (
                <div className="flex justify-between w-48 text-emerald-600 font-bold">
                  <span>Discount:</span>
                  <span>-₹{order.pricing.discount}</span>
                </div>
              )}
              <div className="flex justify-between w-48 text-base font-heading font-black text-gray-900 pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span className="text-primary">₹{order.pricing?.total || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status History Timeline */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-4">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Status History Audit Timeline</span>
            </h3>
            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {order.statusHistory.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-3 text-xs">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-xs" />
                  <div>
                    <span className="font-bold text-gray-900 uppercase">
                      {step.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-gray-400 ml-2">
                      by {step.by || 'admin'} • {new Date(step.at).toLocaleString('en-IN')}
                    </span>
                    {step.note && (
                      <p className="text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 mt-1">
                        {step.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Printable Invoice / Packing Slip Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 print:p-0 print:shadow-none print:m-0 print:w-full">
            {/* Header controls (hidden on print) */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6 print:hidden">
              <h3 className="font-heading font-black text-lg text-gray-900">
                Invoice / Packing Slip Preview
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Document Content */}
            <div id="printable-invoice" className="space-y-6 text-gray-900 font-body">
              {/* Document Header */}
              <div className="flex items-start justify-between border-b pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center">
                      <Leaf className="w-4 h-4 fill-cream" />
                    </div>
                    <span className="font-heading text-2xl font-black text-brandRed">FynDry</span>
                  </div>
                  <p className="text-xs text-gray-500">Premium Solar Dehydrated Fruits & Produce</p>
                  <p className="text-[11px] text-gray-500 mt-1">support@fyndry.com | www.fyndry.com</p>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-heading font-black uppercase text-gray-800">
                    PACKING SLIP / INVOICE
                  </h2>
                  <p className="text-xs font-mono font-bold text-gray-700 mt-1">{order.orderNumber}</p>
                  <p className="text-[11px] text-gray-500">
                    Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Ship To & Payment Mode */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-gray-500 mb-1">Ship To</h4>
                  <p className="font-bold text-gray-900">{order.shippingAddress?.fullName}</p>
                  <p className="text-gray-600 leading-relaxed">
                    {order.shippingAddress?.addressLine1}
                    {order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress?.addressLine2}` : ''}
                    <br />
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} —{' '}
                    <span className="font-bold">{order.shippingAddress?.pincode}</span>
                  </p>
                  <p className="text-gray-600 mt-1">Phone: {order.shippingAddress?.phone}</p>
                </div>

                <div className="text-right">
                  <h4 className="font-bold uppercase tracking-wider text-gray-500 mb-1">Order Details</h4>
                  <p className="text-gray-700">Payment: <strong className="uppercase">{order.paymentMethod}</strong> ({order.payment?.status})</p>
                  {order.courierName && (
                    <p className="text-gray-700">Courier: <strong>{order.courierName}</strong></p>
                  )}
                  {order.trackingId && (
                    <p className="text-gray-700">Tracking #: <strong className="font-mono">{order.trackingId}</strong></p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs text-left border-t border-b border-gray-200">
                <thead className="bg-gray-50 uppercase text-[10px] text-gray-500 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">Variant</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-bold">{it.name}</td>
                      <td className="py-2.5 px-3 text-gray-500">{it.variantLabel}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{it.quantity}</td>
                      <td className="py-2.5 px-3 text-right">₹{it.price}</td>
                      <td className="py-2.5 px-3 text-right font-bold">₹{it.lineTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex flex-col items-end text-xs space-y-1">
                <div className="flex justify-between w-48 text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{order.pricing?.subtotal || 0}</span>
                </div>
                <div className="flex justify-between w-48 text-gray-600">
                  <span>Shipping:</span>
                  <span>{order.pricing?.shippingFee === 0 ? 'FREE' : `₹${order.pricing?.shippingFee}`}</span>
                </div>
                {order.pricing?.tax > 0 && (
                  <div className="flex justify-between w-48 text-gray-600">
                    <span>Tax (GST):</span>
                    <span>₹{order.pricing.tax}</span>
                  </div>
                )}
                <div className="flex justify-between w-48 font-heading font-black text-sm text-gray-900 pt-2 border-t border-gray-200">
                  <span>Grand Total:</span>
                  <span className="text-primary">₹{order.pricing?.total || 0}</span>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-6 border-t border-gray-200 text-center text-[10px] text-gray-400">
                <p>Thank you for choosing FynDry healthy dehydrated produce! 100% natural, farm to table.</p>
                <p className="mt-0.5">Packed with hygiene and sealed for guaranteed crispness.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
