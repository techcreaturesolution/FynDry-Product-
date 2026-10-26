import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, Home, Building, MapPin, Tag, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import addressApi from '../../api/addressApi';
import Input from '../ui/Input';
import Button from '../ui/Button';
import MapLocationPicker from './MapLocationPicker';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Recipient full name is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  addressLine1: z.string().min(3, 'Flat/House No. / Building is required'),
  addressLine2: z.string().optional().default(''),
  landmark: z.string().optional().default(''),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'Please select your state'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit Indian PIN code'),
  country: z.string().default('India'),
  label: z.enum(['Home', 'Work', 'Other']).default('Home'),
  isDefault: z.boolean().optional().default(false),
});

export default function AddressForm({
  initialData = null,
  onSubmit,
  onCancel = null,
  submitLabel = 'Save Address',
  loading = false,
}) {
  const [coords, setCoords] = useState(initialData?.location?.coordinates || null);
  const [formattedAddress, setFormattedAddress] = useState(initialData?.formattedAddress || '');
  const [addedVia, setAddedVia] = useState(initialData?.addedVia || 'manual');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      phone: initialData?.phone || '',
      addressLine1: initialData?.addressLine1 || '',
      addressLine2: initialData?.addressLine2 || '',
      landmark: initialData?.landmark || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      pincode: initialData?.pincode || '',
      country: 'India',
      label: initialData?.label || 'Home',
      isDefault: initialData?.isDefault || false,
    },
  });

  const selectedLabel = watch('label');

  useEffect(() => {
    if (initialData) {
      reset({
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        addressLine1: initialData.addressLine1 || '',
        addressLine2: initialData.addressLine2 || '',
        landmark: initialData.landmark || '',
        city: initialData.city || '',
        state: initialData.state || '',
        pincode: initialData.pincode || '',
        country: 'India',
        label: initialData.label || 'Home',
        isDefault: !!initialData.isDefault,
      });
      setCoords(initialData.location?.coordinates || null);
      setFormattedAddress(initialData.formattedAddress || '');
      setAddedVia(initialData.addedVia || 'manual');
    }
  }, [initialData, reset]);

  // Handle pin movement / geolocation reverse geocoding
  const handleLocationSelect = async ({ lat, lng, isLiveGPS }) => {
    setCoords([lng, lat]);
    if (isLiveGPS) setAddedVia('live_location');

    try {
      const res = await addressApi.reverseGeocode({ lat, lng });
      const data = res.data;
      if (data) {
        if (data.pincode) setValue('pincode', data.pincode, { shouldValidate: true });
        if (data.city) setValue('city', data.city, { shouldValidate: true });
        if (data.state) {
          const matchState = INDIAN_STATES.find(
            (s) => s.toLowerCase() === data.state.toLowerCase()
          );
          if (matchState) setValue('state', matchState, { shouldValidate: true });
        }
        if (data.addressLine2 && !watch('addressLine2')) {
          setValue('addressLine2', data.addressLine2);
        }
        if (data.formattedAddress) {
          setFormattedAddress(data.formattedAddress);
        }
      }
    } catch (err) {
      // Non-blocking reverse geocoding
    }
  };

  const onFormSubmit = async (values) => {
    const payload = {
      ...values,
      location: coords ? { type: 'Point', coordinates: coords } : undefined,
      formattedAddress,
      addedVia,
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 font-body text-left">
      {/* Interactive Map & Geolocation */}
      <MapLocationPicker
        initialCoordinates={coords}
        onLocationSelect={handleLocationSelect}
      />

      {/* Recipient Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          placeholder="e.g. Radhika Sharma"
          icon={User}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Mobile Phone Number"
          placeholder="10-digit mobile e.g. 9876543210"
          icon={Phone}
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      {/* Address Lines */}
      <Input
        label="Flat / House No. / Apartment / Building"
        placeholder="e.g. Flat 402, Green Orchid Apartments"
        icon={Building}
        error={errors.addressLine1?.message}
        {...register('addressLine1')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Area / Street / Sector (Optional)"
          placeholder="e.g. MG Road, Indiranagar"
          {...register('addressLine2')}
        />

        <Input
          label="Landmark (Optional)"
          placeholder="e.g. Near Metro Station / Behind Temple"
          {...register('landmark')}
        />
      </div>

      {/* City, State, PIN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="City / Town"
          placeholder="e.g. Bengaluru"
          error={errors.city?.message}
          {...register('city')}
        />

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            State
          </label>
          <select
            {...register('state')}
            className={`w-full rounded-2xl bg-cream/30 border px-3.5 py-3 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              errors.state ? 'border-brandRed' : 'border-gray-200 focus:border-primary'
            }`}
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="mt-1 text-[11px] font-bold text-brandRed">
              {errors.state.message}
            </p>
          )}
        </div>

        <Input
          label="PIN Code"
          placeholder="6-digit PIN e.g. 560038"
          error={errors.pincode?.message}
          {...register('pincode')}
        />
      </div>

      {/* Address Type Pill Radios */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
          Save Address As:
        </label>
        <div className="flex gap-3">
          {['Home', 'Work', 'Other'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setValue('label', type)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                selectedLabel === type
                  ? 'bg-primary text-white border-primary shadow-soft'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <span>{type}</span>
              {selectedLabel === type && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Default Checkbox */}
      <label className="flex items-center gap-2.5 cursor-pointer pt-1">
        <input
          type="checkbox"
          {...register('isDefault')}
          className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
        />
        <span className="text-xs font-bold text-gray-700">
          Make this my default delivery address
        </span>
      </label>

      {/* Action Buttons */}
      <div className="flex justify-end items-center gap-3 pt-3 border-t border-gray-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading || isSubmitting}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
