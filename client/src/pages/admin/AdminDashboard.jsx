import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import adminApi from '../../api/adminApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getDashboardStats();
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-cream">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats?.totalSales?.toLocaleString('en-IN') || 0}`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: Package,
      color: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      title: 'Active Products',
      value: stats?.totalProducts || 0,
      icon: ShoppingBag,
      color: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      title: 'Registered Customers',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'bg-purple-50 text-purple-700 border-purple-100',
    },
  ];

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Admin Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-primary-100 text-primary text-[11px] font-extrabold uppercase">
              Admin Portal
            </span>
            <span className="text-xs text-gray-400">• Single Vendor Store</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-900 tracking-tight">
            Store Performance <span className="text-primary">Overview</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 text-xs font-bold hover:bg-gray-50 transition-colors shadow-2xs"
          >
            Manage Products
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors shadow-sm"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  {card.title}
                </span>
                <span className="font-heading font-black text-2xl sm:text-3xl text-gray-900">
                  {card.value}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-soft">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <h3 className="font-heading font-bold text-lg text-gray-900">Recent Customer Orders</h3>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.recentOrders?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="p-3.5 rounded-2xl bg-cream-light/60 border border-gray-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-900 block font-heading">
                      #{ord.orderNumber}
                    </span>
                    <span className="text-gray-500">{ord.user?.name || 'Customer'} • {ord.paymentMethod.toUpperCase()}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-primary font-heading block">
                      ₹{ord.totalPrice}
                    </span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary">
                      {ord.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-6 text-center">No orders registered yet.</p>
          )}
        </div>

        {/* Low Stock Alerts (1 col) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-soft">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-4 text-brandRed">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-heading font-bold text-lg text-gray-900">Low Inventory Warnings</h3>
          </div>

          {stats?.lowStockProducts?.length > 0 ? (
            <div className="space-y-2.5">
              {stats.lowStockProducts.map((p) => (
                <div
                  key={p._id}
                  className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-gray-900">{p.name}</p>
                    <span className="text-[10px] uppercase text-gray-500">
                      {typeof p.category === 'object' ? p.category?.name || p.category?.slug : p.category}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md font-extrabold text-amber-800 bg-amber-100">
                    {p.stock} units left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-6 text-center">
              All product inventories are well stocked!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
