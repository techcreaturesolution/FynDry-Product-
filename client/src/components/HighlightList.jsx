import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function HighlightList({
  highlights = [],
  accentColor = '#1F6B3A',
  compact = false,
  className = '',
}) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = shouldReduceMotion
    ? {
        hidden: { opacity: 1, x: 0 },
        visible: { opacity: 1, x: 0 },
      }
    : {
        hidden: { opacity: 0, x: -16 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.4, ease: 'easeOut' },
        },
      };

  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20px' }}
      className={`space-y-2.5 ${className}`}
    >
      {highlights.map((item, idx) => (
        <motion.li
          key={idx}
          variants={itemVariants}
          className="flex items-start gap-3 group"
        >
          <span
            className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs shadow-xs transition-transform duration-200 group-hover:scale-110"
            style={{ backgroundColor: accentColor }}
            aria-hidden="true"
          >
            <Check className="w-3 h-3 stroke-[3]" />
          </span>
          <span
            className={`${
              compact ? 'text-sm text-gray-700' : 'text-base sm:text-lg text-gray-800 font-medium'
            } leading-snug`}
          >
            {item}
          </span>
        </motion.li>
      ))}
    </motion.ul>
  );
}
