import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Leaf,
  ShoppingBag,
  Search,
  User as UserIcon,
  LogOut,
  Package,
  ShieldCheck,
  ChevronDown,
  MapPin,
  Settings,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import useUiStore from '../store/uiStore';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/shop', label: 'Shop' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const { openCart, getTotalItems } = useCartStore();
  const { openSearchModal } = useUiStore();
  const totalCartItems = getTotalItems();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-cream/90 backdrop-blur-md py-3 shadow-soft border-b border-primary/10'
            : 'bg-transparent py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between" aria-label="Main Navigation">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl py-1 px-2 -ml-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white shadow-soft transition-transform duration-300 group-hover:scale-105">
                <Leaf className="w-6 h-6 text-cream fill-cream transform -rotate-12" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-2xl sm:text-3xl font-extrabold text-brandRed tracking-tight leading-none">
                  FynDry
                </span>
                <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-primary -mt-0.5">
                  Naturally Preserved
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/10 shadow-xs">
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.path);

                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-gray-700 hover:text-primary hover:bg-primary-50/50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Action Icons: Search, Cart & Auth */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Modal Trigger */}
              <button
                type="button"
                onClick={openSearchModal}
                className="p-2.5 rounded-full bg-white/80 hover:bg-white text-gray-700 hover:text-primary border border-primary/15 shadow-xs transition-all active:scale-95"
                aria-label="Search Products"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openCart}
                className="relative p-2.5 rounded-full bg-white/80 hover:bg-white text-gray-700 hover:text-primary border border-primary/15 shadow-xs transition-all active:scale-95"
                aria-label="Open Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brandRed text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm"
                  >
                    {totalCartItems}
                  </motion.span>
                )}
              </button>

              {/* User Dropdown / Sign In CTA */}
              <div className="hidden sm:block relative" ref={dropdownRef}>
                {isAuthenticated && user ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-white/80 hover:bg-white rounded-full border border-primary/15 shadow-xs transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="text-xs font-bold text-gray-800 max-w-[100px] truncate">
                        {user.name}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                    </button>

                    <AnimatePresence>
                      {userDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-cream-dark p-2 z-50 font-body"
                        >
                          <div className="px-3 py-2 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                            {isAdmin && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary text-[10px] font-extrabold uppercase">
                                Administrator
                              </span>
                            )}
                          </div>

                          <div className="py-1">
                            {isAdmin && (
                              <Link
                                to="/admin"
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-primary hover:bg-primary-50 rounded-xl transition-colors"
                              >
                                <ShieldCheck className="w-4 h-4" />
                                <span>Admin Dashboard</span>
                              </Link>
                            )}

                            <Link
                              to="/account/profile"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-cream-dark/50 rounded-xl transition-colors"
                            >
                              <UserIcon className="w-4 h-4 text-gray-500" />
                              <span>My Profile</span>
                            </Link>

                            <Link
                              to="/account/addresses"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-cream-dark/50 rounded-xl transition-colors"
                            >
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span>Saved Addresses</span>
                            </Link>

                            <Link
                              to="/account/orders"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-cream-dark/50 rounded-xl transition-colors"
                            >
                              <Package className="w-4 h-4 text-gray-500" />
                              <span>My Orders</span>
                            </Link>
                          </div>

                          <div className="pt-1 border-t border-gray-100">
                            <button
                              type="button"
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brandRed hover:bg-brandRed/10 rounded-xl transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-primary hover:bg-primary-light shadow-soft transition-all duration-200"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-2xl bg-white/80 border border-primary/10 text-gray-800 hover:text-primary focus:outline-none"
                aria-label="Open Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-cream p-6 shadow-2xl z-50 md:hidden flex flex-col justify-between border-l border-primary/10 overflow-y-auto font-body"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-primary/15">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white">
                      <Leaf className="w-5 h-5 fill-cream" />
                    </div>
                    <span className="font-heading text-2xl font-bold text-brandRed">FynDry</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-gray-700 hover:bg-cream-dark"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Mobile User Greeting */}
                {isAuthenticated && user && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-white border border-primary/10 shadow-soft flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{user.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                )}

                <nav className="mt-6 flex flex-col gap-1.5">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-2xl font-bold transition-colors ${
                        location.pathname === link.path
                          ? 'bg-primary text-white'
                          : 'text-gray-800 hover:bg-cream-dark'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {isAuthenticated && (
                    <>
                      <div className="my-2 border-t border-primary/10" />
                      <Link
                        to="/account/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-2.5 rounded-2xl font-bold text-gray-800 hover:bg-cream-dark flex items-center gap-2.5 text-sm"
                      >
                        <UserIcon className="w-4 h-4 text-primary" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/account/addresses"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-2.5 rounded-2xl font-bold text-gray-800 hover:bg-cream-dark flex items-center gap-2.5 text-sm"
                      >
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>Saved Addresses</span>
                      </Link>
                      <Link
                        to="/account/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-2.5 rounded-2xl font-bold text-gray-800 hover:bg-cream-dark flex items-center gap-2.5 text-sm"
                      >
                        <Package className="w-4 h-4 text-primary" />
                        <span>My Orders</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-4 py-2.5 rounded-2xl font-bold text-primary bg-primary-50 flex items-center gap-2.5 text-sm mt-1"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                    </>
                  )}
                </nav>
              </div>

              <div className="pt-6 border-t border-primary/15 space-y-3">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-3 px-4 rounded-full border border-brandRed text-brandRed font-bold text-center block text-sm"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 px-4 rounded-full bg-primary text-white font-bold text-center block shadow-soft text-sm"
                  >
                    Sign In / Register
                  </Link>
                )}
                <p className="text-center text-xs text-gray-500">Goodness, Naturally Preserved</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
