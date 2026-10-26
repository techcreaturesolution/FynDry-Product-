import React from 'react';
import { MapPin, Check, Edit2, Trash2, Home, Briefcase, Tag } from 'lucide-react';

const labelIcons = {
  Home: Home,
  Work: Briefcase,
  Other: Tag,
};

export default function AddressCard({
  address,
  selected = false,
  onSelect = null,
  onEdit = null,
  onDelete = null,
  onSetDefault = null,
  showActions = true,
  className = '',
}) {
  const LabelIcon = labelIcons[address.label] || Tag;

  return (
    <div
      onClick={() => onSelect && onSelect(address._id)}
      className={`relative rounded-3xl p-5 border transition-all duration-200 text-left font-body ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'bg-primary-50/50 border-primary ring-2 ring-primary/20 shadow-soft'
          : 'bg-white border-gray-100 hover:border-gray-200 shadow-xs hover:shadow-soft'
      } ${className}`}
    >
      {/* Top Badges & Selector */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cream text-woodBrown border border-cream-dark">
            <LabelIcon className="w-3.5 h-3.5" />
            <span>{address.label || 'Home'}</span>
          </span>

          {address.isDefault && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Default
            </span>
          )}

          {address.addedVia === 'live_location' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
              📍 GPS Verified
            </span>
          )}
        </div>

        {/* Selection Indicator */}
        {onSelect && (
          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
              selected
                ? 'bg-primary border-primary text-white'
                : 'border-gray-300 bg-white'
            }`}
          >
            {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        )}
      </div>

      {/* Recipient info */}
      <div className="space-y-1 mb-4">
        <div className="flex items-baseline gap-2">
          <h4 className="font-heading font-black text-base text-gray-900">
            {address.fullName}
          </h4>
          <span className="text-xs font-bold text-gray-500">
            {address.phone}
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          {address.addressLine1}
          {address.addressLine2 ? `, ${address.addressLine2}` : ''}
          {address.landmark ? ` (Near ${address.landmark})` : ''}
        </p>

        <p className="text-xs font-bold text-gray-700">
          {address.city}, {address.state} — {address.pincode}
        </p>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-3">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(address);
                }}
                className="inline-flex items-center gap-1 font-bold text-gray-500 hover:text-primary transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(address._id);
                }}
                className="inline-flex items-center gap-1 font-bold text-gray-400 hover:text-brandRed transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {!address.isDefault && onSetDefault && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSetDefault(address._id);
              }}
              className="text-[11px] font-bold text-primary hover:underline"
            >
              Set as Default
            </button>
          )}
        </div>
      )}
    </div>
  );
}
