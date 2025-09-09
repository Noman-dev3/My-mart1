
import { getAllProducts } from './product-actions';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Electronics' | 'Groceries' | 'Fashion' | 'Home Goods';
  rating: number;
  reviews: number;
  brand: string;
  inStock: boolean;
  specifications: Record<string, string>;
  reviewsData: {
    author: string;
    rating: number;
    comment: string;
    date: string;
  }[];
};

let productsCache: Product[] | null = null;
let categoriesCache: string[] | null = null;
let brandsCache: string[] | null = null;

async function fetchProductsAndCache() {
  if (!productsCache) {
    productsCache = await getAllProducts();
    categoriesCache = [...new Set(productsCache.map((p) => p.category))];
    brandsCache = [...new Set(productsCache.map((p) => p.brand))];
  }
}


// These functions now ensure data is fetched before being exported.
// Note: In a real-world scenario with a proper database, you'd likely fetch data
// directly in your components/pages, but this maintains the existing structure.

export const getProducts = async (): Promise<Product[]> => {
  await fetchProductsAndCache();
  return productsCache!;
};

export const getCategories = async (): Promise<string[]> => {
  await fetchProductsAndCache();
  return categoriesCache!;
};

export const getBrands = async (): Promise<string[]> => {
  await fetchProductsAndCache();
  return brandsCache!;
};

// For direct use in pages that can't be async at the top level
export const products: Product[] = [];
export const categories: string[] = [];
export const brands: string[] = [];

// Eagerly fetch and populate the arrays for components that rely on them being available synchronously.
// This is a bit of a workaround for the existing structure.
fetchProductsAndCache().then(() => {
  if (productsCache) {
    products.push(...productsCache);
    categories.push(...categoriesCache!);
    brands.push(...brandsCache!);
  }
});
