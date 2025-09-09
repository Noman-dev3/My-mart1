
'use server';

import { promises as fs } from 'fs';
import path from 'path';

// Re-export the Product type from placeholder-data to avoid duplication
export type { Product } from './placeholder-data';
import type { Product } from './placeholder-data';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const productsFilePath = path.join(process.cwd(), 'src', 'lib', 'products.json');

async function readProducts(): Promise<Product[]> {
    try {
        const fileContent = await fs.readFile(productsFilePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return []; // File doesn't exist, return empty array
        }
        console.error("Error reading products.json:", error);
        throw new Error("Could not read products data.");
    }
}

async function writeProducts(products: Product[]): Promise<void> {
    await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));
    // Revalidate paths to show changes immediately
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin/products');
}

export async function getAllProducts(): Promise<Product[]> {
    return await readProducts();
}

export async function getProductById(productId: string): Promise<Product | undefined> {
    const products = await readProducts();
    return products.find(p => p.id === productId);
}

const productSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long."),
    description: z.string().min(10, "Description must be at least 10 characters long."),
    price: z.coerce.number().min(0, "Price must be a positive number."),
    image: z.string().url("Must be a valid image URL."),
    category: z.enum(['Electronics', 'Groceries', 'Fashion', 'Home Goods']),
    brand: z.string().min(2, "Brand must be at least 2 characters long."),
    inStock: z.boolean(),
});

export async function addProduct(data: z.infer<typeof productSchema>) {
    const products = await readProducts();
    const newProduct: Product = {
        id: `prod_${new Date().getTime()}`,
        ...data,
        rating: 0,
        reviews: 0,
        specifications: {}, // Placeholder for now
        reviewsData: [], // Placeholder for now
    };
    products.unshift(newProduct);
    await writeProducts(products);
    return newProduct;
}

export async function updateProduct(productId: string, data: z.infer<typeof productSchema>) {
    const products = await readProducts();
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
        throw new Error('Product not found');
    }

    const updatedProduct = {
        ...products[productIndex],
        ...data,
    };
    products[productIndex] = updatedProduct;
    await writeProducts(products);
    return updatedProduct;
}

export async function deleteProduct(productId: string) {
    let products = await readProducts();
    const initialLength = products.length;
    products = products.filter(p => p.id !== productId);

    if (products.length === initialLength) {
        throw new Error('Product not found');
    }

    await writeProducts(products);
    return { success: true };
}
