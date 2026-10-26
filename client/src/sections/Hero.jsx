import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Sparkles, ShieldCheck, Heart, Leaf } from 'lucide-react';
import Button from '../components/Button';
import FloatingLeaves from '../components/FloatingLeaves';
import { useReducedMotion } from '../hooks/useReducedMotion';

import appleSlicesWebp from '../assets/products/FynDry_Apple_Slices_Wooden_Bowl_Label.webp';
import appleSlicesPng from '../assets/products/FynDry_Apple_Slices_Wooden_Bowl_Label.png';

import bananaBitesWebp from '../assets/products/FynDry_Banana_Bites_Packaging.webp';
import bananaBitesPng from '../assets/products/FynDry_Banana_Bites_Packaging.png';

import beetrootWebp from '../assets/products/Beetroot_Powder_Naturally_Preserved.webp';
import beetrootPng from '../assets/products/Beetroot_Powder_Naturally_Preserved.png';

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const handleExploreClick = (e) => {
    e.preventDefault();
    const target = document.getElementById('products');
    if (target) {
      const navOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Text stagger animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        },
      };

  return (
    <section
      id="home"
      className="relative min-h-[92vh] flex items-center pt-28 pb-16 lg:pt-32 lg:pb-24 overflow-hidden natural-gradient"
    >
      {/* Background Animated Floating Leaves */}
      <FloatingLeaves />

      {/* Decorative organic background aura */}
      <div
        className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-primary/10 filter blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-accent-banana/15 filter blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Ribbon Badge */}
            <motion.div variants={itemVariants} className="flex justify-center lg:justify-start">
              <span className="ribbon-badge">
                <Sparkles className="w-4 h-4 text-accent-banana fill-accent-banana animate-pulse" />
                <span>Dehydrated Products</span>
              </span>
            </motion.div>

            {/* Brand Heading */}
            <motion.h1
              variants={itemVariants}
              className="font-heading text-6xl sm:text-7xl lg:text-8xl font-black text-brandRed tracking-tight leading-[0.95]"
            >
              FynDry
            </motion.h1>

            {/* Title Line */}
            <motion.h2
              variants={itemVariants}
              className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary-dark tracking-tight"
            >
              Goodness, Naturally Preserved
            </motion.h2>

            {/* Supporting Line */}
            <motion.p
              variants={itemVariants}
              className="font-body text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              Experience 100% farm-pure fruit snacks and wholesome kitchen powders. Sun and air dehydrated to lock in peak flavor, vivid colors, and essential nutrition with zero artificial additives or added oils.
            </motion.p>

            {/* Feature Pills */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 text-xs sm:text-sm font-bold text-woodBrown"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-primary/10 shadow-xs">
                <Leaf className="w-4 h-4 text-primary" />
                100% Pure &amp; Natural
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-primary/10 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Zero Added Oil
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-primary/10 shadow-xs">
                <Heart className="w-4 h-4 text-brandRed" />
                No Preservatives
              </span>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              variants={itemVariants}
              className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Button
                variant="primary"
                size="lg"
                href="#products"
                onClick={handleExploreClick}
                icon={ArrowDown}
                iconPosition="right"
                className="w-full sm:w-auto text-base shadow-soft hover:shadow-xl"
              >
                Explore Products
              </Button>

              <a
                href="#why-fyndry"
                className="inline-flex items-center justify-center font-bold font-body text-base text-gray-700 hover:text-primary px-6 py-3 rounded-full hover:bg-cream-dark transition-colors duration-200"
              >
                Our Preservation Story
              </a>
            </motion.div>
          </motion.div>

          {/* Right Column: Floating Collage of 3 Product Images */}
          <div className="lg:col-span-5 relative flex items-center justify-center mt-6 lg:mt-0">
            {/* Center glow backdrop */}
            <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-primary/15 via-accent-banana/20 to-brandRed/10 filter blur-2xl pointer-events-none" />

            <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
              
              {/* Product 1: Apple Slices (Large Center / Top Left) */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: [0, -12, 0],
                        rotate: [0, 1.5, 0],
                      }
                }
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-2 left-2 w-3/5 z-20"
              >
                <div className="bg-white rounded-3xl p-3 shadow-card-hover border border-white/80 transform hover:scale-105 transition-transform duration-300">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-cream-light p-2 flex items-center justify-center">
                    <picture className="w-full h-full flex items-center justify-center">
                      <source srcSet={appleSlicesWebp} type="image/webp" />
                      <img
                        src={appleSlicesPng}
                        alt="FynDry Dehydrated Apple Slices"
                        width="300"
                        height="300"
                        fetchpriority="high"
                        decoding="async"
                        className="w-full h-full object-contain drop-shadow-md"
                      />
                    </picture>
                  </div>
                  <div className="pt-2 px-1 text-center">
                    <span className="font-heading font-bold text-gray-900 text-sm block">Apple Slices</span>
                    <span className="text-[11px] font-semibold text-accent-apple block">Naturally Sweet Snack</span>
                  </div>
                </div>
              </motion.div>

              {/* Product 2: Banana Bites (Bottom Right) */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: [0, 14, 0],
                        rotate: [0, -2, 0],
                      }
                }
                transition={{
                  duration: 6.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.8,
                }}
                className="absolute bottom-0 right-2 w-7/12 z-20 will-change-transform"
              >
                <div className="bg-white rounded-3xl p-3 shadow-card-hover border border-white/80 transform hover:scale-105 transition-transform duration-300">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-cream-light p-2 flex items-center justify-center">
                    <picture className="w-full h-full flex items-center justify-center">
                      <source srcSet={bananaBitesWebp} type="image/webp" />
                      <img
                        src={bananaBitesPng}
                        alt="FynDry Banana Bites Packaging"
                        width="260"
                        height="260"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain drop-shadow-md"
                      />
                    </picture>
                  </div>
                  <div className="pt-2 px-1 text-center">
                    <span className="font-heading font-bold text-gray-900 text-sm block">Banana Bites</span>
                    <span className="text-[11px] font-semibold text-woodBrown block">Simply Pure Banana</span>
                  </div>
                </div>
              </motion.div>

              {/* Product 3: Beetroot Powder (Floating Top Right Accent) */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: [0, -10, 0],
                        rotate: [0, 2, 0],
                      }
                }
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1.5,
                }}
                className="absolute top-8 right-0 w-5/12 z-10 will-change-transform"
              >
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-2.5 shadow-soft border border-white/60 transform hover:scale-105 transition-transform duration-300">
                  <div className="aspect-square rounded-xl overflow-hidden bg-cream-light p-1.5 flex items-center justify-center">
                    <picture className="w-full h-full flex items-center justify-center">
                      <source srcSet={beetrootWebp} type="image/webp" />
                      <img
                        src={beetrootPng}
                        alt="FynDry Beetroot Powder"
                        width="200"
                        height="200"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain drop-shadow-sm"
                      />
                    </picture>
                  </div>
                  <div className="pt-1 px-0.5 text-center">
                    <span className="font-heading font-bold text-gray-900 text-xs block truncate">Beetroot Powder</span>
                    <span className="text-[10px] font-semibold text-accent-beetroot block truncate">Vibrant Color</span>
                  </div>
                </div>
              </motion.div>

              {/* Quality Floating Floating Badge */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        scale: [1, 1.05, 1],
                      }
                }
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -bottom-4 left-6 z-30 bg-primary text-white py-2 px-4 rounded-2xl shadow-xl flex items-center gap-2 border-2 border-white"
              >
                <Leaf className="w-4 h-4 text-accent-banana fill-accent-banana" />
                <span className="text-xs font-bold font-heading tracking-wide">100% Dehydrated</span>
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
