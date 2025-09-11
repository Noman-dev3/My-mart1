
'use server';

import { getAllProducts } from './product-actions';
import type { Product } from './product-actions';

export type { Product };

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
