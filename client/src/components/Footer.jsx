import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Heart, ArrowUp, Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <footer className="bg-primary-dark text-white pt-16 pb-12 relative overflow-hidden border-t-4 border-primary">
      {/* Background subtle leaf accents */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-accent-banana/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                <Leaf className="w-6 h-6 text-accent-banana fill-accent-banana transform -rotate-12" />
              </div>
              <div>
                <span className="font-heading text-3xl font-extrabold text-white tracking-tight">
                  FynDry
                </span>
              </div>
            </div>
            
            <p className="font-heading text-xl text-accent-banana font-semibold">
              Goodness, Naturally Preserved.
            </p>
            
            <p className="text-gray-300 text-sm sm:text-base max-w-sm leading-relaxed">
              We bring you farm-pure dehydrated fruit snacks and wholesome culinary powders crafted without artificial colors, preservatives, or added oils. Pure nature in every pantry.
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs text-cream/70 font-medium">
              <ShieldCheck className="w-4 h-4 text-primary-light" />
              <span>Certified Natural Process • Non-GMO • Zero Artificial Additives</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading text-lg font-bold text-white tracking-wide uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a
                  href="#home"
                  onClick={(e) => handleNavClick(e, 'home')}
                  className="hover:text-accent-banana transition-colors duration-150 inline-block py-1"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#products"
                  onClick={(e) => handleNavClick(e, 'products')}
                  className="hover:text-accent-banana transition-colors duration-150 inline-block py-1"
                >
                  Our Products
                </a>
              </li>
              <li>
                <a
                  href="#why-fyndry"
                  onClick={(e) => handleNavClick(e, 'why-fyndry')}
                  className="hover:text-accent-banana transition-colors duration-150 inline-block py-1"
                >
                  Why FynDry
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => handleNavClick(e, 'contact')}
                  className="hover:text-accent-banana transition-colors duration-150 inline-block py-1"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Products Categories */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-heading text-lg font-bold text-white tracking-wide uppercase">
              Our Ranges
            </h4>
            <div className="space-y-2.5 text-sm text-gray-300">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-accent-banana/50 transition-colors">
                <span className="font-bold text-white block">Fruit Snacks</span>
                <span className="text-xs text-gray-300">Apple Slices & Banana Bites — Pure fruit with zero oil.</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-accent-banana/50 transition-colors">
                <span className="font-bold text-white block">Culinary Powders</span>
                <span className="text-xs text-gray-300">Red Onion, Beetroot & Garlic Powder for instant kitchen ease.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} <strong className="text-white">FynDry</strong>. All rights reserved.
          </p>

          {/* Legal Links for Razorpay and Consumer Compliance */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-300">
            <Link to="/privacy-policy" className="hover:text-accent-banana transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms-and-conditions" className="hover:text-accent-banana transition-colors">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link to="/refund-policy" className="hover:text-accent-banana transition-colors">
              Refund Policy
            </Link>
            <span>•</span>
            <Link to="/shipping-policy" className="hover:text-accent-banana transition-colors">
              Shipping Policy
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-banana"
              aria-label="Scroll back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
