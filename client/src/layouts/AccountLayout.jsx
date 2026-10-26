import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { User, MapPin, Package, LogOut, ArrowLeft } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function AccountLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const navItems = [
    { to: '/account/profile', label: 'My Profile', icon: User },
    { to: '/account/addresses', label: 'Saved Addresses', icon: MapPin },
    { to: '/account/orders', label: 'Order History', icon: Package },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Back */}
      <div className="mb-6">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Account Hero Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light text-white flex items-center justify-center font-heading text-2xl font-bold shadow-soft">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-gray-900 leading-tight">
              {user?.name || 'Customer Account'}
            </h1>
            <p className="text-sm text-gray-500 font-body">{user?.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-brandRed hover:bg-brandRed/10 border border-brandRed/20 transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Layout Grid: Sidebar Navigation + Main Account Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="md:col-span-1">
          <nav className="bg-white rounded-3xl p-3 border border-gray-100 shadow-soft space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white shadow-soft'
                        : 'text-gray-700 hover:bg-cream hover:text-primary'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <section className="md:col-span-3">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
