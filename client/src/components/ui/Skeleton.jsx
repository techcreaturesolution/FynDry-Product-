import React from 'react';

export default function Skeleton({ className = '', variant = 'rectangular', ...props }) {
  const variantStyles = {
    circular: 'rounded-full',
    rectangular: 'rounded-2xl',
    text: 'rounded-md h-4 w-full',
  };

  return (
    <div
      className={`animate-pulse bg-gray-200/80 ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}
