import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  maxWidth = 'max-w-md',
  footer = null,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const slideVariants = {
    right: {
      hidden: { x: '100%' },
      visible: { x: 0 },
    },
    left: {
      hidden: { x: '-100%' },
      visible: { x: 0 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <div
            className={`fixed inset-y-0 ${
              position === 'right' ? 'right-0' : 'left-0'
            } flex max-w-full`}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={slideVariants[position]}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className={`w-screen ${maxWidth} bg-white shadow-2xl flex flex-col z-10`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-cream/30">
                {title && (
                  <h3 className="text-xl font-heading font-bold text-gray-900 tracking-tight">
                    {title}
                  </h3>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors ml-auto"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">{children}</div>

              {/* Optional Footer */}
              {footer && (
                <div className="border-t border-gray-100 p-6 bg-cream/10">{footer}</div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
