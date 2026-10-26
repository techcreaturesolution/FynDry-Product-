import React from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import Button from '../ui/Button';

export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      icon: AlertTriangle,
      bg: 'bg-red-100 text-brandRed',
      btnVariant: 'danger',
    },
    warning: {
      icon: AlertCircle,
      bg: 'bg-amber-100 text-amber-600',
      btnVariant: 'primary',
    },
    info: {
      icon: Info,
      bg: 'bg-blue-100 text-blue-600',
      btnVariant: 'primary',
    },
  };

  const { icon: Icon, bg, btnVariant } = iconConfig[variant] || iconConfig.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-body animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-xl transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>

          <div className="flex-1 pr-6">
            <h3 className="text-lg font-heading font-black text-gray-900 tracking-tight">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>

          <Button
            type="button"
            variant={btnVariant}
            size="sm"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
