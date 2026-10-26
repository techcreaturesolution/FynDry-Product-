import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional().default(''),
  image: z.string().trim().optional().default(''),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();
