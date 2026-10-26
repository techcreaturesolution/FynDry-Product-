import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import ScrollProgress from '../components/ScrollProgress';
import SearchModal from '../components/common/SearchModal';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-gray-800 font-body selection:bg-primary-100 selection:text-primary-700">
      <ScrollProgress />
      <Navbar />
      <SearchModal />
      <CartDrawer />

      <main className="flex-grow pt-20">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
