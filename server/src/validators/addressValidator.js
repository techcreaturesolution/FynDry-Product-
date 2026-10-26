import { z } from 'zod';

export const createAddressSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+?91)?[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number'),
  addressLine1: z.string().trim().min(2, 'Address line 1 (house / flat / building) is required'),
  addressLine2: z.string().trim().optional().default(''),
  landmark: z.string().trim().optional().default(''),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, 'Please provide a valid 6-digit Indian PIN code'),
  country: z.string().trim().optional().default('India'),
  label: z.enum(['Home', 'Work', 'Other']).optional().default('Home'),
  isDefault: z.boolean().optional().default(false),
  location: z
    .object({
      type: z.literal('Point').default('Point'),
      coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
    })
    .optional(),
  formattedAddress: z.string().trim().optional().default(''),
  addedVia: z.enum(['manual', 'live_location']).optional().default('manual'),
});

export const updateAddressSchema = createAddressSchema.partial();

export const reverseGeoSchema = z.object({
  lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lng: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
});
