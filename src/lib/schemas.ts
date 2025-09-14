
'use client';

import { z } from 'zod';

const specificationSchema = z.object({
  key: z.string().min(1, "Specification key cannot be empty."),
  value: z.string().min(1, "Specification value cannot be empty."),
});

// This schema is for the CLIENT-SIDE FORM and what it submits.
// It uses an array for specifications because that's how react-hook-form's useFieldArray works.
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

// This schema represents the data structure for the DATABASE.
// Specifications are a JSONB object, not an array.
export const productDbSchema = productSchema.extend({
  specifications: z.record(z.string()).optional(),
  // Omit fields that are not directly submitted by the form but are part of the Product type
}).omit({ reviews_data: true, questions: true });

export type ProductDbValues = z.infer<typeof productDbSchema>;
