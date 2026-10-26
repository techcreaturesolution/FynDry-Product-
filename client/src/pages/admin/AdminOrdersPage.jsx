import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ShoppingBag,
  Eye,
  Calendar,
  RotateCcw,
  CheckCircle,
  Clock,
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import DataTable from '../../components/admin/DataTable';
import Badge from '../../components/ui/Badge';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        status: statusFilter || undefined,
        paymentStatus: paymentFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: search.trim() || undefined,
      };

      const res = await adminApi.getAllOrders(params);
      const list = Array.isArray(res.data) ? res.data : (res.data?.orders || []);
      setOrders(list);
      setTotalOrders(res.total || list.length);
      setTotalPages(res.pages || Math.ceil((res.total || list.length) / 15) || 1);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, paymentFilter, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setPaymentFilter('');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setPage(1);
  };

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order ID',
      render: (ordNo, ord) => (
        <div>
          <Link
            to={`/admin/orders/${ord._id}`}
            className="font-bold text-gray-900 hover:text-primary transition-colors block text-sm"
          >
            {ordNo}
          </Link>
          <span className="text-[10px] text-gray-400 font-mono">
            {new Date(ord.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (_, ord) => (
        <div>
          <p className="font-bold text-gray-800 text-xs">
            {ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}
          </p>
          <p className="text-[11px] text-gray-400">
            {ord.shippingAddress?.phone || ord.user?.phone || ord.user?.email || 'N/A'}
          </p>
          <p className="text-[10px] text-gray-400 truncate max-w-[140px]">
            {ord.shippingAddress?.city}, {ord.shippingAddress?.state}
          </p>
        </div>
      ),
    },
    {
      key: 'items',
      label: 'Items Summary',
      render: (_, ord) => {
        const items = ord.items || [];
        const count = items.reduce((acc, it) => acc + (it.quantity || 1), 0);
        const firstItem = items[0]?.name || 'Item';

        return (
          <div className="text-xs">
            <span className="font-bold text-gray-700 block truncate max-w-[160px]">
              {firstItem}
              {items.length > 1 && ` +${items.length - 1} more`}
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              {count} total pack(s)
            </span>
          </div>
        );
      },
    },
    {
      key: 'pricing',
      label: 'Total Amount',
      render: (pricing, ord) => (
        <div>
          <span className="font-heading font-black text-primary text-sm block">
            ₹{(pricing?.total || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] uppercase font-bold text-gray-400">
            {ord.paymentMethod}
          </span>
        </div>
      ),
    },
    {
      key: 'payment',
      label: 'Payment',
      render: (payment) => (
        <Badge
          variant={
            payment?.status === 'paid'
              ? 'success'
              : payment?.status === 'refunded'
              ? 'danger'
              : 'warning'
          }
        >
          {payment?.status || 'pending'}
        </Badge>
      ),
    },
    {
      key: 'orderStatus',
      label: 'Fulfillment Status',
      render: (status) => (
        <Badge
          variant={
            status === 'delivered'
              ? 'success'
              : status === 'cancelled'
              ? 'danger'
              : 'primary'
          }
        >
          {status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'View',
      align: 'right',
      render: (_, ord) => (
        <Link
          to={`/admin/orders/${ord._id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary-50 text-primary hover:bg-primary hover:text-white transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 tracking-tight">
            Customer Orders Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track customer shipments, payment settlements, dispatch courier waybills, and print packing slips.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-soft space-y-4">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order #, customer name, phone, city..."
              className="w-full bg-gray-50 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm border border-gray-200 focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-2xl text-xs sm:text-sm font-bold hover:bg-primary-dark transition-colors"
          >
            Search
          </button>
        </form>

        {/* Secondary Filter Row: Status, Payment, Date Range, Reset */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-gray-50 rounded-2xl px-3 py-1.5 text-xs font-bold border border-gray-200 focus:outline-none focus:border-primary cursor-pointer text-gray-700"
          >
            <option value="">All Fulfillment Statuses</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            className="bg-gray-50 rounded-2xl px-3 py-1.5 text-xs font-bold border border-gray-200 focus:outline-none focus:border-primary cursor-pointer text-gray-700"
          >
            <option value="">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="bg-gray-50 rounded-2xl px-3 py-1.5 text-xs font-bold border border-gray-200 focus:outline-none focus:border-primary text-gray-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="bg-gray-50 rounded-2xl px-3 py-1.5 text-xs font-bold border border-gray-200 focus:outline-none focus:border-primary text-gray-700"
            />
          </div>

          {(statusFilter || paymentFilter || startDate || endDate || search) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold text-gray-500 hover:text-brandRed hover:bg-red-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Reusable DataTable with Pagination */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        pagination={{
          page,
          totalPages,
          totalCount: totalOrders,
          onPageChange: (p) => setPage(p),
        }}
        emptyMessage="No customer orders found matching your search or filters."
      />
    </div>
  );
}
