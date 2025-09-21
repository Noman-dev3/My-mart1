
import { z } from 'zod';

const specificationSchema = z.object({
  key: z.string().min(1, "Specification key cannot be empty."),
  value: z.string().min(1, "Specification value cannot be empty."),
});

// This is the single source of truth for form validation.
export const productFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  // Use z.coerce.number() to handle string-to-number conversion from form data
  price: z.coerce.number({invalid_type_error: "Price must be a number."}).min(0, "Price must be a positive number."),
  image: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  category: z.enum(['Electronics', 'Groceries', 'Fashion', 'Home Goods', 'Bakery']),
  brand: z.string().min(2, "Brand must be at least 2 characters long."),
  // Use z.coerce.number() to handle string-to-number conversion from form data
  stock_quantity: z.coerce.number({invalid_type_error: "Stock must be a number."}).int("Stock must be a whole number.").min(0, "Stock must be non-negative."),
  barcode: z.string().min(8, "Barcode must be at least 8 characters long."),
  specifications: z.array(specificationSchema).optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
// This is the shape of the data that will be sent to the database.
// It is slightly different from the form values because of the specifications field.
export type ProductDbValues = Omit<ProductFormValues, 'specifications'> & {
    specifications?: Record<string, string>;
};
