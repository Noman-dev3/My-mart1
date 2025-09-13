
import { z } from 'zod';

// SINGLE SOURCE OF TRUTH FOR PRODUCT VALIDATION
export const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  image: z.string().url("Must be a valid image URL."),
  category: z.enum(['Electronics', 'Groceries', 'Fashion', 'Home Goods']),
  brand: z.string().min(2, "Brand must be at least 2 characters long."),
  stockQuantity: z.coerce.number().int("Stock must be a whole number."),
  barcode: z.string().min(8, "Barcode must be at least 8 characters long."),
  specifications: z.any().optional(),
  reviewsData: z.any().optional(),
  questions: z.any().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
