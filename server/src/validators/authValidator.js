import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z
    .string()
    .trim()
    .refine((val) => !val || /^[0-9]{10}$/.test(val), {
      message: 'Phone must be a valid 10-digit number',
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().trim().email('Please provide a valid email address').optional(),
  phone: z.string().trim().optional(),
});

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  phone: z.string().trim().min(10, 'Valid 10-digit phone number is required'),
  street: z.string().trim().min(3, 'Street address is required'),
  landmark: z.string().trim().optional().default(''),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  postalCode: z.string().trim().min(5, 'Postal code is required'),
  country: z.string().trim().default('India'),
  isDefault: z.boolean().optional().default(false),
  location: z
    .object({
      type: z.literal('Point').default('Point'),
      coordinates: z.tuple([z.number(), z.number()]).default([0, 0]),
    })
    .optional(),
  formattedAddress: z.string().trim().optional().default(''),
});
