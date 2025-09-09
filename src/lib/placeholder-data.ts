
'use server';

import { getAllProducts } from './product-actions';

// Re-export the Product type to be used across the application.
export type { Product } from './product-actions';
import type { Product } from './product-actions';

// This function now simply acts as a passthrough to the main data-fetching function.
// This avoids complex caching issues within a single request.
export async function getProducts(): Promise<Product[]> {
  return getAllProducts();
}

export async function getCategories(): Promise<string[]> {
    const products = await getProducts();
    const categories = [...new Set(products.map((p) => p.category))];
    return categories;
}

export async function getBrands(): Promise<string[]> {
    const products = await getProducts();
    const brands = [...new Set(products.map((p) => p.brand))];
    return brands;
}
