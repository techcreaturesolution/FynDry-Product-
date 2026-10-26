import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  href,
  type = 'button',
  icon: Icon,
  iconPosition = 'right',
  disabled = false,
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();

  const baseStyles = 'inline-flex items-center justify-center font-bold font-body transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-sm px-4 py-2 gap-1.5',
    md: 'text-base px-6 py-3 gap-2',
    lg: 'text-lg px-8 py-4 gap-2.5 shadow-md',
  };

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-light focus:ring-primary shadow-soft hover:shadow-lg',
    secondary: 'bg-cream-dark text-woodBrown hover:bg-woodBrown hover:text-white focus:ring-woodBrown',
    accent: 'bg-brandRed text-white hover:bg-brandRed-light focus:ring-brandRed shadow-soft hover:shadow-lg',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
    ghost: 'text-primary hover:bg-primary-50 focus:ring-primary',
  };

  const motionProps = shouldReduceMotion
    ? {}
    : {
        whileHover: disabled ? {} : { scale: 1.03 },
        whileTap: disabled ? {} : { scale: 0.97 },
        transition: { type: 'spring', stiffness: 400, damping: 17 },
      };

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon className="w-5 h-5 flex-shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-5 h-5 flex-shrink-0" />}
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...motionProps}
        {...props}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...motionProps}
      {...props}
    >
      {content}
    </motion.button>
  );
}
