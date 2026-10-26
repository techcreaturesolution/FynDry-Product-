import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function SectionTitle({
  badge,
  title,
  subtitle,
  align = 'center',
  className = '',
  titleColor = 'text-gray-900',
  badgeColor = 'bg-primary-100 text-primary-700 border-primary-200',
}) {
  const shouldReduceMotion = useReducedMotion();

  const containerAnim = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-50px' },
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
      };

  const isCenter = align === 'center';

  return (
    <motion.div
      {...containerAnim}
      className={`max-w-3xl ${isCenter ? 'mx-auto text-center' : 'text-left'} ${className}`}
    >
      {badge && (
        <span
          className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase border mb-3 shadow-xs ${badgeColor}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          {badge}
        </span>
      )}
      {title && (
        <h2 className={`font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 ${titleColor}`}>
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="font-body text-base sm:text-lg text-gray-600 leading-relaxed text-balance">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
