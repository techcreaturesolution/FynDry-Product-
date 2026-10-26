import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import adminApi from '../../api/adminApi';

const statuses = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setOrders(res.data?.orders || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, orderStatus: newStatus } : ord))
      );
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-900 tracking-tight">
            Order Fulfillment & <span className="text-primary">Dispatch</span>
          </h1>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-gray-200 overflow-x-auto text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              statusFilter === 'all' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                statusFilter === st ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream border-b border-cream-dark text-gray-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Order ID & Date</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Items</th>
                <th className="py-4 px-6">Total & Payment</th>
                <th className="py-4 px-6">Delivery Address</th>
                <th className="py-4 px-6 text-right">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    Loading customer orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No orders found for the selected status.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const dateStr = new Date(ord.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={ord._id} className="hover:bg-cream-light/60 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-heading font-extrabold text-sm text-gray-900 block">
                          #{ord.orderNumber}
                        </span>
                        <span className="text-gray-400 text-[11px]">{dateStr}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-gray-900 block">
                          {ord.user?.name || ord.shippingAddress?.fullName}
                        </span>
                        <span className="text-gray-500 text-[11px]">
                          {ord.user?.email || ord.shippingAddress?.phone}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-800 block">
                          {ord.orderItems?.length} {ord.orderItems?.length === 1 ? 'item' : 'items'}
                        </span>
                        <span className="text-[10px] text-gray-500 truncate max-w-[140px] block">
                          {ord.orderItems?.map((i) => i.name).join(', ')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-heading font-black text-sm text-primary block">
                          ₹{ord.totalPrice}
                        </span>
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.paymentMethod.toUpperCase()} • {ord.isPaid ? 'PAID' : 'PENDING'}
                        </span>
                      </td>
                      <td className="py-4 px-6 max-w-[200px]">
                        <p className="text-gray-600 truncate">{ord.shippingAddress?.street}</p>
                        <p className="text-gray-400 text-[11px]">
                          {ord.shippingAddress?.city}, {ord.shippingAddress?.postalCode}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-gray-300 bg-white text-gray-800 focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
                        >
                          {statuses.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
