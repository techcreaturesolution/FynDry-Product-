import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  variant = 'primary', // 'primary' | 'emerald' | 'amber' | 'red' | 'purple'
  className = '',
}) {
  const variantStyles = {
    primary: {
      bg: 'bg-primary-50 text-primary',
      accent: 'border-l-primary',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-700',
      accent: 'border-l-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-700',
      accent: 'border-l-amber-500',
    },
    red: {
      bg: 'bg-red-50 text-brandRed',
      accent: 'border-l-brandRed',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-700',
      accent: 'border-l-purple-600',
    },
  };

  const style = variantStyles[variant] || variantStyles.primary;

  return (
    <div
      className={`bg-white rounded-3xl p-6 border border-gray-100 shadow-soft border-l-4 ${style.accent} hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 font-body">
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-2xl ${style.bg} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 tracking-tight">
          {value}
        </h3>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-bold ${
              trendPositive ? 'text-emerald-600' : 'text-brandRed'
            }`}
          >
            {trendPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] font-medium text-gray-500 font-body mt-1.5">{subtitle}</p>
      )}
    </div>
  );
}
