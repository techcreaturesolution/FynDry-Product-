import { z } from 'zod';

export const variantInputSchema = z.object({
  label: z.string().trim().min(1, 'Variant label is required (e.g. 100g)'),
  weightInGrams: z.number().nonnegative().optional().default(0),
  price: z.number().min(0, 'Variant price must be non-negative'),
  mrp: z.number().nonnegative().optional().default(0),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(50),
  sku: z.string().trim().optional().default(''),
});

export const imageInputSchema = z.object({
  url: z.string().trim().min(1, 'Image URL is required'),
  publicId: z.string().trim().optional().default(''),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters'),
  slug: z.string().trim().optional(),
  shortDescription: z.string().trim().optional().default(''),
  description: z.string().trim().min(5, 'Product description is required'),
  tagline: z.string().trim().optional().default(''),
  highlights: z.array(z.string()).optional().default([]),
  category: z.string().trim().min(1, 'Category reference ID is required'),
  images: z.array(imageInputSchema).optional().default([]),
  accentColor: z.string().trim().optional().default('#1F6B3A'),
  variants: z
    .array(variantInputSchema)
    .min(1, 'At least one variant (e.g. 100g) is required for the product'),
  tags: z.array(z.string()).optional().default([]),
  ingredients: z.string().trim().optional().default(''),
  shelfLife: z.string().trim().optional().default('12 Months'),
  storageInstructions: z.string().trim().optional().default('Store in a cool, dry place.'),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  ratingAvg: z.number().min(0).max(5).optional().default(4.8),
  ratingCount: z.number().int().min(0).optional().default(0),
  order: z.number().int().optional().default(0),
});

export const updateProductSchema = createProductSchema.partial();

export const updateStockSchema = z.object({
  variantId: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  stock: z.number().int().min(0, 'Stock must be 0 or greater'),
});
