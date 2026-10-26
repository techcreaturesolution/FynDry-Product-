import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  Ban,
  Clock,
  Box,
  CheckCircle2,
  XCircle,
  Sparkles,
  SunMedium,
  Wind,
  PackageCheck,
  TrendingUp,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import SectionTitle from '../components/SectionTitle';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function WhyFynDry() {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState('comparison');

  const features = [
    {
      id: 'naturally-preserved',
      title: 'Naturally Preserved',
      icon: Leaf,
      badge: 'Gentle Dehydration',
      color: '#1F6B3A',
      bgColor: 'bg-primary-50',
      description:
        'We gently extract moisture using low-temperature warm air circulation. This natural physical process locks in dietary fiber, cellular structure, crisp texture, and vital micronutrients without harsh scorching heat or chemicals.',
      highlight: 'Retains up to 95% of fresh nutritional value',
    },
    {
      id: 'no-artificial-additives',
      title: 'No Artificial Additives',
      icon: Ban,
      badge: 'Pure Clean Label',
      color: '#A3260F',
      bgColor: 'bg-red-50',
      description:
        'Zero synthetic food dyes, zero chemical shelf extenders (no sulfur dioxide, no BHA/BHT), and absolutely NO added frying oils. Just honest, real food straight from the soil and orchard.',
      highlight: 'Single-ingredient honesty you can trust',
    },
    {
      id: 'easy-to-use',
      title: 'Easy to Use',
      icon: Clock,
      badge: 'Zero Prep Time',
      color: '#E8890C',
      bgColor: 'bg-amber-50',
      description:
        'Skip peeling sticky garlic cloves, chopping tear-inducing onions, and washing fruit. Our snacks are ready to crunch immediately, and our culinary powders dissolve smoothly into curries, sauces, and baking.',
      highlight: 'Saves 20+ minutes of daily kitchen prep',
    },
    {
      id: 'pantry-friendly',
      title: 'Pantry Friendly',
      icon: Box,
      badge: 'Extended Shelf Life',
      color: '#8B5A2B',
      bgColor: 'bg-stone-50',
      description:
        'Because water activity is completely eliminated, FynDry products remain delightfully shelf-stable at room temperature. No refrigeration required, no food spoilage, and zero waste in your kitchen.',
      highlight: 'Zero food waste & compact pantry storage',
    },
  ];

  const stats = [
    { label: 'Added Frying Oil', value: '0%', sub: 'Naturally dry & crisp' },
    { label: 'Nutrients Retained', value: '95%', sub: 'Gentle air-drying' },
    { label: 'Artificial Preservatives', value: 'ZERO', sub: 'Clean single ingredients' },
    { label: 'Pure Farm Produce', value: '100%', sub: 'Sun-kissed harvests' },
  ];

  const comparisonRows = [
    {
      factor: 'Cooking Method',
      traditional: 'Deep-fried in industrial oils or roasted at scorching heat',
      fyndry: 'Gentle low-temperature warm air dehydration',
      winner: 'fyndry',
    },
    {
      factor: 'Preservative Additives',
      traditional: 'Sulfur dioxide, artificial nitrates & chemical binders',
      fyndry: '100% Free of artificial chemicals or sulfites',
      winner: 'fyndry',
    },
    {
      factor: 'Oil & Caloric Density',
      traditional: 'Soaked with hidden trans/vegetable fats',
      fyndry: 'Zero added oils — only original plant nutrients',
      winner: 'fyndry',
    },
    {
      factor: 'Nutrient & Fiber Retention',
      traditional: 'Vitamins destroyed by extreme frying temperatures',
      fyndry: 'Up to 95% bioavailable vitamins, enzymes & fiber preserved',
      winner: 'fyndry',
    },
    {
      factor: 'Pantry Longevity',
      traditional: 'Oils turn rancid over time, requires chemical stabilizers',
      fyndry: 'Natural moisture removal prevents bacterial decay indefinitely',
      winner: 'fyndry',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Peak Harvest Selection',
      desc: 'Sourced directly from orchards and fields at the exact moment of ripeness for peak aroma and natural sugars.',
      icon: SunMedium,
    },
    {
      step: '02',
      title: 'Gentle Air Dehydration',
      desc: 'Controlled warm air gently lifts water molecules while leaving cell structures, dietary fibers, and flavors intact.',
      icon: Wind,
    },
    {
      step: '03',
      title: 'Sealed Pantry Perfection',
      desc: 'Airtight packaging locks out humidity so you enjoy farm-fresh crunch and potent flavor whenever inspiration strikes.',
      icon: PackageCheck,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const cardVariants = shouldReduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
      };

  return (
    <section id="why-fyndry" className="py-20 lg:py-28 bg-cream relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <SectionTitle
          badge="The FynDry Difference"
          title="Why Choose FynDry?"
          subtitle="Modern snacking and cooking shouldn't compromise on purity. Here is why our dehydration technology is changing pantries for good."
          align="center"
          badgeColor="bg-woodBrown/10 text-woodBrown border-woodBrown/20"
        />

        {/* 1. Quick Stats Metric Counter Ribbon */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 mb-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/80 backdrop-blur-xs rounded-3xl p-6 text-center border border-primary/10 shadow-soft hover:shadow-card-hover transition-all duration-300 group"
            >
              <span className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary block tracking-tight group-hover:scale-105 transition-transform duration-200">
                {stat.value}
              </span>
              <span className="font-heading text-sm sm:text-base font-bold text-gray-900 block mt-1">
                {stat.label}
              </span>
              <span className="text-xs text-gray-500 font-medium block mt-0.5">
                {stat.sub}
              </span>
            </div>
          ))}
        </motion.div>

        {/* 2. Four Core Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.id}
                variants={cardVariants}
                whileHover={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: -8,
                        transition: { duration: 0.25 },
                      }
                }
                className="bg-white rounded-3xl p-7 shadow-card hover:shadow-card-hover border border-gray-100 flex flex-col justify-between transition-all duration-300 group"
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${feature.bgColor} transition-transform duration-300 group-hover:scale-110 shadow-xs`}
                      style={{ color: feature.color }}
                    >
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="font-body text-gray-600 text-sm leading-relaxed mb-6">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom Highlight pill */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <Sparkles
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: feature.color }}
                    />
                    <span>{feature.highlight}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* 3. Interactive Comparison Matrix */}
        <div className="mt-20 bg-white rounded-4xl p-6 sm:p-10 shadow-card border border-primary/10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-primary-100 text-primary-800 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Side-By-Side Comparison
            </span>
            <h3 className="font-heading text-3xl font-bold text-gray-900">
              Conventional Snacks vs. FynDry
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              See why switching to naturally dehydrated produce makes all the difference for your health and pantry.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-500 w-1/4">
                    Comparison Factor
                  </th>
                  <th className="py-4 px-4 text-sm font-bold text-red-600 w-3/8 bg-red-50/50 rounded-t-2xl">
                    <span className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Conventional Fried / Chemically Preserved
                    </span>
                  </th>
                  <th className="py-4 px-4 text-sm font-bold text-primary w-3/8 bg-primary-50/70 rounded-t-2xl">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      FynDry Dehydrated Goodness
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-cream-light/60 transition-colors">
                    <td className="py-4 px-4 font-bold text-gray-800">
                      {row.factor}
                    </td>
                    <td className="py-4 px-4 text-gray-600 bg-red-50/30">
                      {row.traditional}
                    </td>
                    <td className="py-4 px-4 font-semibold text-primary-dark bg-primary-50/40">
                      <span className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{row.fyndry}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. The 3-Step Farm-to-Pantry Process */}
        <div className="mt-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-woodBrown block mb-1">
              Natural Simplicity
            </span>
            <h3 className="font-heading text-3xl font-bold text-gray-900">
              Our 3-Step Preservation Process
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((st, i) => {
              const Icon = st.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-8 border border-gray-100 shadow-card relative flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-heading text-4xl font-black text-primary/20">
                      {st.step}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-primary">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-heading text-xl font-bold text-gray-900 mb-2">
                      {st.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Banner Box */}
        <div className="mt-16 bg-gradient-to-r from-primary via-primary-light to-primary rounded-3xl p-8 sm:p-10 text-white shadow-soft-lg flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <h4 className="font-heading text-2xl sm:text-3xl font-bold">
              Pure Ingredients. Honest Food. No Shortcuts.
            </h4>
            <p className="text-cream/90 text-sm sm:text-base max-w-2xl">
              From our partner farm groves straight into your kitchen pantry, we respect nature’s original design.
            </p>
          </div>
          <a
            href="#contact"
            className="px-7 py-3.5 rounded-full bg-accent-banana text-gray-900 font-bold hover:bg-yellow-400 transition-all shadow-md text-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-accent-banana focus:ring-offset-2 focus:ring-offset-primary"
          >
            Connect With Our Team
          </a>
        </div>

      </div>
    </section>
  );
}
