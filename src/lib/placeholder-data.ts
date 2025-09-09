
'use server';

import { getAllProducts } from './product-actions';

// Re-export the Product type to be used across the application.
export type { Product } from './product-actions';
import type { Product } from './product-actions';

// We keep a simple cache to avoid re-reading the file on every call within the same request.
let productsCache: Product[] | null = null;
let categoriesCache: string[] | null = null;
let brandsCache: string[] | null = null;

async function fetchProductsAndCache(): Promise<Product[]> {
    if (productsCache) {
        return productsCache;
    }
    const products = await getAllProducts();
    productsCache = products;
    
    // Invalidate cache after a short time in development to reflect changes
    if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
            productsCache = null;
            categoriesCache = null;
            brandsCache = null;
        }, 1000);
    }
    return products;
}

export async function getProducts(): Promise<Product[]> {
  return fetchProductsAndCache();
}

export async function getCategories(): Promise<string[]> {
    if (categoriesCache) {
        return categoriesCache;
    }
    const products = await fetchProductsAndCache();
    categoriesCache = [...new Set(products.map((p) => p.category))];
    return categoriesCache;
}

export async function getBrands(): Promise<string[]> {
    if (brandsCache) {
        return brandsCache;
    }
    const products = await fetchProductsAndCache();
    brandsCache = [...new Set(products.map((p) => p.brand))];
    return brandsCache;
}
