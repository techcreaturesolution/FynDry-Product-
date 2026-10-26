import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AccountLayout from '../layouts/AccountLayout';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// UI
import Spinner from '../components/ui/Spinner';
import PageTransition from '../components/ui/PageTransition';

// Lazy-loaded Public Pages
const HomePage = lazy(() => import('../pages/public/HomePage'));
const ShopPage = lazy(() => import('../pages/public/ShopPage'));
const ProductDetailPage = lazy(() => import('../pages/public/ProductDetailPage'));
const CartPage = lazy(() => import('../pages/public/CartPage'));
const AboutPage = lazy(() => import('../pages/public/AboutPage'));
const ContactPage = lazy(() => import('../pages/public/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('../pages/public/PrivacyPolicyPage'));
const TermsConditionsPage = lazy(() => import('../pages/public/TermsConditionsPage'));
const RefundPolicyPage = lazy(() => import('../pages/public/RefundPolicyPage'));
const ShippingPolicyPage = lazy(() => import('../pages/public/ShippingPolicyPage'));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'));

// Lazy-loaded Auth Pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));

// Lazy-loaded Checkout Pages
const CheckoutPage = lazy(() => import('../pages/checkout/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('../pages/checkout/OrderSuccessPage'));

// Lazy-loaded Account Pages
const ProfilePage = lazy(() => import('../pages/account/ProfilePage'));
const AddressesPage = lazy(() => import('../pages/account/AddressesPage'));
const OrdersPage = lazy(() => import('../pages/account/OrdersPage'));
const OrderDetailPage = lazy(() => import('../pages/account/OrderDetailPage'));

// Lazy-loaded Admin Pages
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('../pages/admin/AdminProductsPage'));
const AdminProductNewPage = lazy(() => import('../pages/admin/AdminProductNewPage'));
const AdminProductEditPage = lazy(() => import('../pages/admin/AdminProductEditPage'));
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage'));
const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('../pages/admin/AdminOrderDetailPage'));
const AdminCustomersPage = lazy(() => import('../pages/admin/AdminCustomersPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));

function SuspenseFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Spinner size="lg" />
      <p className="mt-3 text-xs font-bold text-gray-400 font-body">Loading...</p>
    </div>
  );
}

export default function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<SuspenseFallback />}>
        <Routes location={location} key={location.pathname}>
          {/* =========================================
              AUTH ROUTES (AuthLayout)
             ========================================= */}
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={
                <PageTransition>
                  <LoginPage />
                </PageTransition>
              }
            />
            <Route
              path="/register"
              element={
                <PageTransition>
                  <RegisterPage />
                </PageTransition>
              }
            />
          </Route>

          {/* =========================================
              PUBLIC & STOREFRONT ROUTES (PublicLayout)
             ========================================= */}
          <Route element={<PublicLayout />}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <HomePage />
                </PageTransition>
              }
            />
            <Route
              path="/shop"
              element={
                <PageTransition>
                  <ShopPage />
                </PageTransition>
              }
            />
            <Route
              path="/product/:slug"
              element={
                <PageTransition>
                  <ProductDetailPage />
                </PageTransition>
              }
            />
            <Route
              path="/cart"
              element={
                <PageTransition>
                  <CartPage />
                </PageTransition>
              }
            />
            <Route
              path="/about"
              element={
                <PageTransition>
                  <AboutPage />
                </PageTransition>
              }
            />
            <Route
              path="/contact"
              element={
                <PageTransition>
                  <ContactPage />
                </PageTransition>
              }
            />
            <Route
              path="/privacy-policy"
              element={
                <PageTransition>
                  <PrivacyPolicyPage />
                </PageTransition>
              }
            />
            <Route
              path="/terms-and-conditions"
              element={
                <PageTransition>
                  <TermsConditionsPage />
                </PageTransition>
              }
            />
            <Route
              path="/refund-policy"
              element={
                <PageTransition>
                  <RefundPolicyPage />
                </PageTransition>
              }
            />
            <Route
              path="/shipping-policy"
              element={
                <PageTransition>
                  <ShippingPolicyPage />
                </PageTransition>
              }
            />

            {/* Customer Protected Checkout Flow */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/checkout"
                element={
                  <PageTransition>
                    <CheckoutPage />
                  </PageTransition>
                }
              />
              <Route
                path="/order-success/:id"
                element={
                  <PageTransition>
                    <OrderSuccessPage />
                  </PageTransition>
                }
              />
            </Route>

            {/* Customer Protected Account Flow */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AccountLayout />}>
                <Route
                  path="/account/profile"
                  element={
                    <PageTransition>
                      <ProfilePage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/account/addresses"
                  element={
                    <PageTransition>
                      <AddressesPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/account/orders"
                  element={
                    <PageTransition>
                      <OrdersPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/account/orders/:id"
                  element={
                    <PageTransition>
                      <OrderDetailPage />
                    </PageTransition>
                  }
                />
                {/* Legacy redirect aliases */}
                <Route path="/profile" element={<Navigate to="/account/profile" replace />} />
                <Route path="/orders" element={<Navigate to="/account/orders" replace />} />
              </Route>
            </Route>

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <PageTransition>
                  <NotFoundPage />
                </PageTransition>
              }
            />
          </Route>

          {/* =========================================
              ADMIN ROUTES (AdminLayout + AdminRoute Guard)
             ========================================= */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route
                path="/admin"
                element={
                  <PageTransition>
                    <AdminDashboardPage />
                  </PageTransition>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <PageTransition>
                    <AdminProductsPage />
                  </PageTransition>
                }
              />
              <Route
                path="/admin/products/new"
                element={
                  <PageTransition>
                    <AdminProductNewPage />
                  </PageTransition>
                }
              />
              <Route
                path="/admin/products/:id/edit"
                element={
                  <PageTransition>
                    <AdminProductEditPage />
                  </PageTransition>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <PageTransition>
                    <AdminCategoriesPage />
                  </PageTransition>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <PageTransition>
                    <AdminOrdersPage />
                  </PageTransition>
                }
              />
              <Route
                path="/admin/orders/:id"
                element={
                  <PageTransition>
                    <AdminOrderDetailPage />
                  </PageTransition>
                }
              />
              <Route
                path="/admin/customers"
                element={
                  <PageTransition>
                    <AdminCustomersPage />
                  </PageTransition>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <PageTransition>
                    <AdminSettingsPage />
                  </PageTransition>
                }
              />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}
