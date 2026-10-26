import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title = 'No items found',
  description = 'There are no items to display at this moment.',
  actionText,
  onAction,
  actionHref,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white/70 backdrop-blur-sm rounded-3xl border border-gray-100 ${className}`}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-3xl bg-primary-50 text-primary flex items-center justify-center mb-4 shadow-inner">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 max-w-md font-body mb-6">
        {description}
      </p>

      {actionText && (
        <Button
          onClick={onAction}
          href={actionHref}
          variant="primary"
          size="md"
        >
          {actionText}
        </Button>
      )}
    </motion.div>
  );
}
