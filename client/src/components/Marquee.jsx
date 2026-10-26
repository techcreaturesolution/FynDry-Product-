import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Leaf } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function Marquee({
  items = [
    'No Artificial Additives',
    'Naturally Preserved',
    'Easy to Use',
    'Pantry Friendly',
    '100% Wholesome Ingredients',
    'Farm Sourced Goodness',
  ],
  speed = 25,
  direction = 'left',
  className = '',
}) {
  const shouldReduceMotion = useReducedMotion();

  // Duplicate items array to make loop infinite and seamless
  const duplicatedItems = [...items, ...items, ...items, ...items];

  return (
    <div className={`relative w-full overflow-hidden whitespace-nowrap select-none py-3 ${className}`}>
      {/* Edge gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none" />

      <motion.div
        className="inline-flex items-center gap-8 text-white font-heading text-lg sm:text-xl font-semibold tracking-wide"
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
              }
        }
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: speed,
        }}
      >
        {duplicatedItems.map((text, idx) => (
          <div key={idx} className="inline-flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-accent-banana opacity-90 fill-accent-banana" />
              <span>{text}</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cream opacity-50" aria-hidden="true" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
