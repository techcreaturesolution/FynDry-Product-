import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft, ShoppingBag } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 font-body">
      <div className="w-20 h-20 rounded-3xl bg-cream-dark/60 text-primary flex items-center justify-center mb-6 shadow-inner">
        <Leaf className="w-10 h-10 text-primary transform -rotate-12" />
      </div>

      <span className="text-sm font-extrabold text-brandRed tracking-widest uppercase mb-2">
        Error 404
      </span>

      <h1 className="text-4xl sm:text-6xl font-heading font-black text-gray-900 tracking-tight mb-4">
        Page Naturally Vanished
      </h1>

      <p className="text-sm sm:text-base text-gray-600 max-w-md mb-8 leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily
        unavailable. Let's get you back to real, honest food.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button href="/" variant="outline" icon={ArrowLeft} iconPosition="left">
          Return Home
        </Button>
        <Button href="/shop" variant="primary" icon={ShoppingBag} iconPosition="right">
          Explore Shop
        </Button>
      </div>
    </div>
  );
}
