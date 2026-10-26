import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';
import FloatingLeaves from '../components/FloatingLeaves';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-body text-gray-800">
      {/* Organic floating leaves background decoration */}
      <FloatingLeaves />

      {/* Back to store navigation link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-xs font-bold text-gray-700 hover:text-primary border border-primary/10 shadow-xs transition-colors backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </Link>
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white shadow-soft transition-transform group-hover:scale-105">
            <Leaf className="w-6 h-6 text-cream fill-cream transform -rotate-12" />
          </div>
          <span className="font-heading text-3xl font-black text-brandRed tracking-tight">
            FynDry
          </span>
        </Link>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          Goodness, Naturally Preserved
        </p>
      </div>

      {/* Main Form Card Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-primary/10">
          <Outlet />
        </div>

        {/* Footer Guarantee */}
        <p className="mt-6 text-center text-xs text-gray-500 font-body">
          100% Pure & Organic • Zero Added Sugar • No Preservatives
        </p>
      </div>
    </div>
  );
}
