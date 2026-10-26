import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  ShoppingBag,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Package,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import adminApi from '../../api/adminApi';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/admin/StatCard';

const STATUS_COLORS = {
  placed: '#3B82F6', // Blue
  confirmed: '#8B5CF6', // Purple
  packed: '#F59E0B', // Amber
  shipped: '#10B981', // Emerald
  out_for_delivery: '#06B6D4', // Cyan
  delivered: '#1F6B3A', // Primary Green
  cancelled: '#A3260F', // Brand Red
  returned: '#6B7280', // Gray
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await adminApi.getDashboardStats();
        setStats(res.data?.data || res.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center font-body">
        <Spinner size="lg" />
        <p className="mt-4 text-xs font-bold text-gray-500">Loading store analytics...</p>
      </div>
    );
  }

  const revenue = stats?.revenue || { today: 0, sevenDays: 0, thirtyDays: 0 };
  const dailySeries = stats?.dailyRevenueSeries || [];
  const lowStock = stats?.lowStockProducts || [];
  const topProducts = stats?.topProducts || [];
  const recentOrders = stats?.recentOrders || [];
  const totalCustomers = stats?.totalCustomers || 0;
  const orderCount = stats?.orderCount || 0;
  const pendingOrders = stats?.pendingOrders || 0;

  // Format orders-by-status data for Pie Chart
  const statusRaw = stats?.ordersByStatus || {};
  const statusPieData = Object.entries(statusRaw).map(([key, count]) => ({
    name: key.replace(/_/g, ' ').toUpperCase(),
    value: Number(count),
    key,
  })).filter((item) => item.value > 0);

  // If no orders yet, dummy pie data
  const chartPieData = statusPieData.length > 0
    ? statusPieData
    : [{ name: 'No Orders', value: 1, key: 'none' }];

  return (
    <div className="space-y-8 font-body">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 tracking-tight">
          Admin Dashboard Overview
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Real-time metrics on gross revenue, customer activity, inventory thresholds, and recent sales.
        </p>
      </div>

      {/* 1. Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5">
        <StatCard
          title="Today's Revenue"
          value={`₹${(revenue.today || 0).toLocaleString('en-IN')}`}
          subtitle="Settled today"
          icon={DollarSign}
          variant="emerald"
        />
        <StatCard
          title="7-Day Revenue"
          value={`₹${(revenue.sevenDays || 0).toLocaleString('en-IN')}`}
          subtitle="Past week gross"
          icon={TrendingUp}
          variant="primary"
        />
        <StatCard
          title="30-Day Revenue"
          value={`₹${(revenue.thirtyDays || 0).toLocaleString('en-IN')}`}
          subtitle="Monthly gross"
          icon={DollarSign}
          variant="purple"
        />
        <StatCard
          title="Total Orders"
          value={orderCount}
          subtitle="Lifetime checkouts"
          icon={ShoppingBag}
          variant="primary"
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrders}
          subtitle="Awaiting dispatch"
          icon={Clock}
          variant="amber"
        />
        <StatCard
          title="Total Customers"
          value={totalCustomers}
          subtitle="Registered accounts"
          icon={Users}
          variant="emerald"
        />
      </div>

      {/* 2. Visualizations Row: Recharts Revenue Line Chart + Orders By Status Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-soft flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-black text-lg text-gray-900">
                Revenue Trajectory (Past 7 Days)
              </h3>
              <p className="text-xs text-gray-400">Daily gross revenue and volume</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary-50 text-primary border border-primary-100">
              7 Days
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySeries} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => val?.substring(5) || val}
                  tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 'bold' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `₹${val}`}
                  tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 'bold' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val, name) => [
                    name === 'revenue' ? `₹${val.toLocaleString('en-IN')}` : val,
                    name === 'revenue' ? 'Revenue' : 'Orders',
                  ]}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1F6B3A"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#1F6B3A', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, fill: '#1F6B3A' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Status Donut Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-black text-lg text-gray-900 mb-1">
              Orders by Fulfillment Status
            </h3>
            <p className="text-xs text-gray-400 mb-4">Current order distribution</p>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.key] || '#9CA3AF'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} orders`, name]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Legend Pills */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
            {statusPieData.map((st) => (
              <div key={st.key} className="flex items-center gap-1.5 text-[11px]">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[st.key] || '#9CA3AF' }}
                />
                <span className="font-bold text-gray-700 capitalize">
                  {st.key.replace(/_/g, ' ')}:
                </span>
                <span className="text-gray-500 font-mono">{st.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Two Columns: Low Stock Alerts + Top-Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-soft">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-brandRed" />
              <h3 className="font-heading font-black text-lg text-gray-900">
                Low-Stock Alerts (≤ 5 units)
              </h3>
            </div>
            <Link to="/admin/products" className="text-xs font-bold text-primary hover:underline">
              Manage Products →
            </Link>
          </div>

          {lowStock.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              All product variants currently have healthy inventory levels.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lowStock.map((prod) => (
                <div key={prod._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{prod.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {prod.variants?.map((v) => `${v.label}: ${v.stock} in stock`).join(' • ')}
                    </p>
                  </div>
                  <Link
                    to={`/admin/products/${prod._id}/edit`}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brandRed/10 text-brandRed hover:bg-brandRed/20 transition-colors"
                  >
                    Restock
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top-Selling Products */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-soft">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-black text-lg text-gray-900">
                Top-Selling Products by Volume
              </h3>
            </div>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No product purchase data recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {topProducts.map((tp, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-heading font-bold text-gray-400 text-sm">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{tp.name}</h4>
                      <p className="text-xs text-gray-500">
                        {tp.totalUnitsSold} units sold
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-primary">₹{(tp.totalRevenue || 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Recent Orders Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-soft">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <div>
            <h3 className="font-heading font-black text-lg text-gray-900">
              Recent Customer Orders
            </h3>
            <p className="text-xs text-gray-400">Latest transactions received across India</p>
          </div>
          <Link to="/admin/orders" className="text-xs font-bold text-primary hover:underline">
            View All Orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-400">No orders received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold tracking-wider">
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-gray-50/50">
                    <td className="py-3.5 font-bold text-gray-900">{ord.orderNumber}</td>
                    <td className="py-3.5 text-gray-700">
                      {ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}
                    </td>
                    <td className="py-3.5 text-gray-500">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="py-3.5 font-black text-primary">
                      ₹{(ord.pricing?.total || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5">
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
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        to={`/admin/orders/${ord._id}`}
                        className="font-bold text-primary hover:underline"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
