import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, ArrowRight, Truck, CheckCircle2, Clock, Filter } from 'lucide-react';
import orderApi from '../../api/orderApi';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';

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

const paymentBadgeVariants = {
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
  refunded: 'purple',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    document.title = 'Order History | FynDry Account';
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 8,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };
      const res = await orderApi.getMyOrders(params);
      const list = Array.isArray(res.data) ? res.data : (res.data?.orders || []);
      setOrders(list);
      setTotalCount(res.total || list.length);
      setTotalPages(res.pages || Math.ceil((res.total || list.length) / 8) || 1);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, currentPage]);

  const handleFilterChange = (st) => {
    setStatusFilter(st);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 font-body">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <h3 className="text-xl font-heading font-black text-gray-900">
              My Order History
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Review current delivery dispatches, inspect invoice breakdowns, and track order records.
            </p>
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'placed', label: 'Placed' },
              { id: 'shipped', label: 'In Transit' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleFilterChange(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === f.id
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-cream text-gray-700 hover:bg-cream-dark'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-16 flex flex-col items-center justify-center">
            <Spinner size="md" />
            <p className="mt-3 text-xs text-gray-500 font-bold">Loading your order history...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <EmptyState
            icon={Package}
            title={statusFilter === 'all' ? 'No Orders Placed Yet' : `No ${statusFilter} orders found`}
            description="Explore our natural dehydrated fruit crisps and savory instant soup mixes."
            actionText="Start Shopping"
            actionHref="/shop"
            className="my-8"
          />
        )}

        {/* Orders Listing */}
        {!loading && orders.length > 0 && (
          <div className="divide-y divide-gray-100 mt-2">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div key={order._id} className="py-6 first:pt-4 last:pb-0">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-black text-base text-gray-900">
                          {order.orderNumber || order._id}
                        </span>
                        <Badge variant={statusBadgeVariants[order.orderStatus] || 'default'}>
                          {order.orderStatus?.replace(/_/g, ' ')}
                        </Badge>
                        <Badge variant={paymentBadgeVariants[order.payment?.status] || 'default'}>
                          Payment: {order.payment?.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Placed on {formattedDate}</span>
                      </p>
                    </div>

                    <Link
                      to={`/account/orders/${order._id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark transition-colors self-start sm:self-auto"
                    >
                      <span>View Details & Invoice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Items Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {order.items?.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-cream/30 border border-gray-100 text-xs"
                      >
                        <img
                          src={
                            it.image ||
                            '/assets/products/Apple_Slices_Natural_Goodness_Label.webp'
                          }
                          alt={it.name}
                          className="w-12 h-12 rounded-xl object-contain bg-white p-1 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-heading font-bold text-gray-900 truncate">
                            {it.name}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {it.variantLabel || '100g'} × {it.quantity}
                          </p>
                          <span className="font-extrabold text-primary text-xs">
                            ₹{it.lineTotal || it.price * it.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total footer */}
                  <div className="mt-4 pt-3 flex justify-between items-center text-xs text-gray-500">
                    <span>
                      Payment Method:{' '}
                      <strong className="text-gray-800 uppercase">
                        {order.paymentMethod || 'Razorpay'}
                      </strong>
                    </span>
                    <span className="text-sm">
                      Total: <strong className="font-black text-gray-900 text-base">₹{order.pricing?.total}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => {
                setCurrentPage(p);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
