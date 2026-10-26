import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  ShoppingBag,
  DollarSign,
  Calendar,
  X,
  ExternalLink,
  Mail,
  Phone,
  Package,
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import DataTable from '../../components/admin/DataTable';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Customer Detail Drawer state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCustomers({
        page,
        limit: 15,
        search: search.trim() || undefined,
      });

      const list = Array.isArray(res.data) ? res.data : (res.data?.customers || []);
      setCustomers(list);
      setTotalCustomers(res.total || list.length);
      setTotalPages(res.pages || Math.ceil((res.total || list.length) / 15) || 1);
    } catch (err) {
      toast.error('Failed to load customers list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleOpenCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setLoadingCustomer(true);
    try {
      const res = await adminApi.getCustomerById(customer._id);
      const data = res.data?.data || res.data;
      if (data) {
        setSelectedCustomer(data.customer || customer);
        setCustomerOrders(data.orders || []);
      }
    } catch (err) {
      console.warn('Could not fetch single customer orders, using row data:', err);
    } finally {
      setLoadingCustomer(false);
    }
  };

  const columns = [
    {
      key: 'customer',
      label: 'Customer',
      render: (_, c) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary font-heading font-black flex items-center justify-center text-sm shrink-0 border border-primary/20">
            {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{c.name}</p>
            <span className="text-[10px] text-gray-400 font-mono">ID: {c._id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact Info',
      render: (_, c) => (
        <div className="text-xs">
          <p className="text-gray-800 font-medium">{c.email}</p>
          <p className="text-gray-400 text-[11px]">{c.phone || 'No phone registered'}</p>
        </div>
      ),
    },
    {
      key: 'joinedAt',
      label: 'Joined Date',
      render: (_, c) => {
        const date = new Date(c.joinedAt || c.createdAt);
        return (
          <span className="text-xs text-gray-500 font-medium">
            {date.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        );
      },
    },
    {
      key: 'orderCount',
      label: 'Orders Placed',
      render: (count) => (
        <span className="font-bold text-gray-800 px-2.5 py-1 rounded-xl bg-gray-100 text-xs">
          {count || 0} order(s)
        </span>
      ),
    },
    {
      key: 'totalSpent',
      label: 'Lifetime Spent',
      align: 'right',
      render: (spent) => (
        <span className="font-heading font-black text-primary text-sm">
          ₹{(spent || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      render: (_, c) => (
        <button
          type="button"
          onClick={() => handleOpenCustomer(c)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary-50 text-primary hover:bg-primary hover:text-white transition-colors"
        >
          View Profile
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 tracking-tight">
            Registered Customers Directory
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Total {totalCustomers} registered shoppers, order volume, and lifetime revenue contribution.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-soft">
        <form onSubmit={handleSearch} className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name, email, or phone..."
            className="w-full bg-gray-50 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm border border-gray-200 focus:outline-none focus:border-primary"
          />
        </form>
      </div>

      {/* Reusable DataTable with Pagination */}
      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        pagination={{
          page,
          totalPages,
          totalCount: totalCustomers,
          onPageChange: (p) => setPage(p),
        }}
        emptyMessage="No customers match your search query."
      />

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-end p-0 sm:p-4 animate-fade-in"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="bg-white w-full sm:max-w-lg h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white font-heading font-black flex items-center justify-center text-lg shadow-soft">
                  {selectedCustomer.name ? selectedCustomer.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-gray-900">
                    {selectedCustomer.name}
                  </h3>
                  <span className="text-[11px] text-gray-400 font-mono">
                    ID: {selectedCustomer._id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact & Spending Stats */}
            <div className="py-4 space-y-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>{selectedCustomer.email}</span>
              </div>
              {selectedCustomer.phone && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>{selectedCustomer.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Member since{' '}
                  {new Date(selectedCustomer.joinedAt || selectedCustomer.createdAt).toLocaleDateString(
                    'en-IN',
                    { month: 'long', year: 'numeric' }
                  )}
                </span>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Total Orders
                  </span>
                  <span className="text-lg font-heading font-black text-gray-900">
                    {selectedCustomer.orderCount || customerOrders.length || 0}
                  </span>
                </div>
                <div className="p-3 bg-cream/40 rounded-2xl border border-primary/20">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Lifetime Spent
                  </span>
                  <span className="text-lg font-heading font-black text-primary">
                    ₹{(selectedCustomer.totalSpent || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer's Order History */}
            <div className="py-4 flex-1">
              <h4 className="text-xs font-heading font-black text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span>Customer Order History</span>
              </h4>

              {loadingCustomer ? (
                <div className="py-8 flex flex-col items-center justify-center">
                  <Spinner size="md" />
                  <p className="mt-2 text-xs text-gray-400">Loading customer orders...</p>
                </div>
              ) : customerOrders.length === 0 ? (
                <p className="py-8 text-center text-xs text-gray-400">
                  No orders found for this customer.
                </p>
              ) : (
                <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
                  {customerOrders.map((ord) => (
                    <div key={ord._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <Link
                          to={`/admin/orders/${ord._id}`}
                          className="font-bold text-gray-900 hover:text-primary transition-colors block"
                        >
                          {ord.orderNumber}
                        </Link>
                        <p className="text-[11px] text-gray-400">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          • {ord.items?.length || 1} item(s)
                        </p>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <div>
                          <span className="font-heading font-black text-primary block">
                            ₹{(ord.pricing?.total || 0).toLocaleString('en-IN')}
                          </span>
                          <Badge
                            variant={
                              ord.orderStatus === 'delivered'
                                ? 'success'
                                : ord.orderStatus === 'cancelled'
                                ? 'danger'
                                : 'primary'
                            }
                          >
                            {ord.orderStatus}
                          </Badge>
                        </div>
                        <Link
                          to={`/admin/orders/${ord._id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100"
                          title="View order"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Close Drawer Button */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-2xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
