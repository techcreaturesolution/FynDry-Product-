import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Leaf,
  Sun,
  ShieldCheck,
  HeartHandshake,
  CheckCircle,
  ShoppingBag,
  Sparkles,
  Award,
} from 'lucide-react';
import SectionTitle from '../../components/SectionTitle';

export default function AboutPage() {
  const pillars = [
    {
      title: '100% Whole Food',
      desc: 'Real apples, ripe bananas, pungent garlic, and vibrant beetroots. No purees, fillers, or starch bulking agents.',
      icon: Leaf,
      color: 'bg-primary-50 text-primary',
    },
    {
      title: 'Gentle Warm-Air Dehydration',
      desc: 'Low-temperature slow dehydration preserves natural vitamins, enzymes, dietary fiber, and authentic aromas.',
      icon: Sun,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Zero Chemical Additives',
      desc: 'No sulfur dioxide for artificial coloring, no synthetic preservatives, and zero palm or refined oils.',
      icon: ShieldCheck,
      color: 'bg-red-50 text-brandRed',
    },
    {
      title: 'Direct Farm Partnerships',
      desc: 'Harvested at peak season from verified local Indian orchards and sustainable agricultural growers.',
      icon: HeartHandshake,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  const milestones = [
    {
      year: '1',
      title: 'Peak Harvest Selection',
      desc: 'We inspect and procure only Grade-A farm fresh produce directly from regional farmers at peak ripeness.',
    },
    {
      year: '2',
      title: 'Clean Wash & Thin Precision Slice',
      desc: 'Produce is gently washed in purified water and sliced to exact millimetric thickness for uniform drying.',
    },
    {
      year: '3',
      title: 'Controlled Dehydration Chamber',
      desc: 'Continuous convection warm air extracts 85–95% water while locking in natural phytonutrients.',
    },
    {
      year: '4',
      title: 'Moisture-Barrier Nitrogen Flush Packaging',
      desc: 'Immediately sealed into multilayer pouches to maintain crisp crunch and fresh taste for up to 12 months.',
    },
  ];

  return (
    <div className="py-8 sm:py-16 space-y-16 sm:space-y-24">
      {/* 1. Header Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100 text-primary text-xs font-bold uppercase tracking-wider mb-4"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Story & Philosophy</span>
        </motion.div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-gray-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Goodness, Naturally Preserved From Soil to Snack
        </h1>

        <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-body leading-relaxed">
          At FynDry, we believe the best food is the food nature made. We simply remove the water
          so you can enjoy nature’s finest nutrients, vibrant flavors, and authentic crunch anywhere, anytime.
        </p>
      </section>

      {/* 2. Core Pillars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title="The FynDry Promise"
          subtitle="How we maintain uncompromised purity in every single pack"
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-12">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-14 h-14 rounded-2xl ${pillar.color} flex items-center justify-center mb-5`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-body leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. The 4-Step Dehydration Process */}
      <section className="bg-white/80 py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="The Art & Science of Dehydration"
            subtitle="From fresh orchard harvest to your pantry in four gentle steps"
            centered
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {milestones.map((step, index) => (
              <div
                key={step.title}
                className="relative bg-cream/40 rounded-3xl p-6 border border-primary/10 flex flex-col"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-white font-heading font-black text-lg flex items-center justify-center mb-4 shadow-soft">
                  {step.year}
                </div>
                <h4 className="text-lg font-heading font-bold text-gray-900 mb-2">
                  {step.title}
                </h4>
                <p className="text-sm text-gray-600 font-body leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why We Never Fry */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cream rounded-3xl p-8 sm:p-12 border border-primary/15 shadow-soft flex flex-col lg:flex-row items-center gap-8 justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brandRed/10 text-brandRed text-xs font-bold uppercase tracking-wider mb-3">
              <Award className="w-4 h-4" />
              <span>Clean Label Transparency</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-heading font-black text-gray-900 leading-tight">
              Why Dehydration Beats Vacuum-Frying
            </h3>
            <p className="mt-4 text-sm sm:text-base text-gray-600 font-body leading-relaxed">
              Many "vegetable chips" in the market are vacuum-fried in palm oil and contain 30%+ fat.
              FynDry products contain <strong>0% added oil</strong> and <strong>0g trans fats</strong>.
              You taste the original fruit, not heated oil.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Zero Cholesterol</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Zero Added Salt or MSG</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>100% Vegan & Gluten-Free</span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-base shadow-soft hover:shadow-lg transition-all"
            >
              <ShoppingBag className="w-5 h-5 text-cream" />
              <span>Taste The Difference</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
