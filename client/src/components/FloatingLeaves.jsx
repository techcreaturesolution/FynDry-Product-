import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function FloatingLeaves() {
  const shouldReduceMotion = useReducedMotion();

  // Floating configurations for distinct leaves
  const leaves = [
    {
      id: 1,
      size: 48,
      top: '12%',
      left: '5%',
      color: '#1F6B3A',
      opacity: 0.18,
      duration: 7,
      delay: 0,
      yDelta: -18,
      rotDelta: 15,
    },
    {
      id: 2,
      size: 64,
      top: '30%',
      right: '6%',
      color: '#2E8B4F',
      opacity: 0.15,
      duration: 8.5,
      delay: 1,
      yDelta: -22,
      rotDelta: -20,
    },
    {
      id: 3,
      size: 36,
      top: '65%',
      left: '8%',
      color: '#8B5A2B',
      opacity: 0.12,
      duration: 6,
      delay: 2,
      yDelta: -14,
      rotDelta: 12,
    },
    {
      id: 4,
      size: 52,
      top: '78%',
      right: '10%',
      color: '#1F6B3A',
      opacity: 0.16,
      duration: 9,
      delay: 0.5,
      yDelta: -20,
      rotDelta: -15,
    },
    {
      id: 5,
      size: 32,
      top: '48%',
      left: '48%',
      color: '#F2B705',
      opacity: 0.14,
      duration: 7.5,
      delay: 1.5,
      yDelta: -16,
      rotDelta: 25,
    },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {leaves.map((leaf) => {
        const motionProps = shouldReduceMotion
          ? {}
          : {
              animate: {
                y: [0, leaf.yDelta, 0],
                rotate: [0, leaf.rotDelta, 0],
              },
              transition: {
                duration: leaf.duration,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: leaf.delay,
              },
            };

        return (
          <motion.div
            key={leaf.id}
            {...motionProps}
            style={{
              position: 'absolute',
              top: leaf.top,
              left: leaf.left,
              right: leaf.right,
              opacity: leaf.opacity,
            }}
          >
            <svg
              width={leaf.size}
              height={leaf.size}
              viewBox="0 0 24 24"
              fill={leaf.color}
              xmlns="http://www.w3.org/2000/svg"
              className="transform drop-shadow-sm filter"
            >
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 11 11 9 17 8Z" />
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
}
