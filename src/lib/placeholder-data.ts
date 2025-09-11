
import { getCategories, getBrands, getAllProducts, type Product } from './product-actions';

export type { Product };

// These functions remain as they fetch derived data, which is fine to do on the server.
// The components using them will be client components that call these server actions.
export async function getCategoryList(): Promise<string[]> {
    return await getCategories();
}

export async function getBrandList(): Promise<string[]> {
    return await getBrands();
}
