
'use client';

import { z } from 'zod';

const specificationSchema = z.object({
  key: z.string().min(1, "Specification key cannot be empty."),
  value: z.string().min(1, "Specification value cannot be empty."),
});

// FOR THE CLIENT-SIDE FORM (react-hook-form)
export const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  image: z.string().url("Must be a valid image URL."),
  category: z.enum(['Electronics', 'Groceries', 'Fashion', 'Home Goods', 'Bakery']),
  brand: z.string().min(2, "Brand must be at least 2 characters long."),
  stock_quantity: z.coerce.number().int("Stock must be a whole number."),
  barcode: z.string().min(8, "Barcode must be at least 8 characters long."),
  specifications: z.array(specificationSchema).optional(),
  reviews_data: z.any().optional(),
  questions: z.any().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;


// FOR THE SERVER-SIDE ACTION (what the DB expects)
export const productDbSchema = productSchema.extend({
  specifications: z.record(z.string()).optional(), // Expects an object, not an array of objects
});

export type ProductDbValues = z.infer<typeof productDbSchema>;
