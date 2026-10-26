import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

/**
 * Custom hook to safely detect if user has requested reduced motion.
 * Respects OS accessibility settings.
 */
export function useReducedMotion() {
  const shouldReduceMotion = useFramerReducedMotion();
  return Boolean(shouldReduceMotion);
}

export default useReducedMotion;
