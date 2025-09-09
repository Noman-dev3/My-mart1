'use server';

import { promises as fs } from 'fs';
import path from 'path';

// Re-export the Product type from placeholder-data to avoid duplication
export type { Product } from './placeholder-data';
import type { Product } from './placeholder-data';


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
}

export async function getAllProducts(): Promise<Product[]> {
    return await readProducts();
}

export async function getProductById(productId: string): Promise<Product | undefined> {
    const products = await readProducts();
    return products.find(p => p.id === productId);
}

// Add more actions (addProduct, updateProduct, deleteProduct) will be added later
