
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

// We define the Product type here as this file is the source of truth for product data structures.
export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: 'Electronics' | 'Groceries' | 'Fashion' | 'Home Goods';
    brand: string;
    inStock: boolean;
    rating: number;
    reviews: number;
    specifications: Record<string, string>;
    reviewsData: {
      author: string;
      rating: number;
      comment: string;
      date: string;
    }[];
    createdAt: any;
};

const productsCollection = collection(db, 'products');

export async function getAllProducts(): Promise<Product[]> {
    const q = query(productsCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getProductById(productId: string): Promise<Product | undefined> {
    const products = await getAllProducts();
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
    const newProduct = {
        ...data,
        rating: Math.floor(Math.random() * 5) + 1,
        reviews: Math.floor(Math.random() * 100),
        specifications: {}, // Placeholder
        reviewsData: [], // Placeholder
        createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(productsCollection, newProduct);
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin/products');
    return { ...newProduct, id: docRef.id };
}

export async function updateProduct(productId: string, data: z.infer<typeof productSchema>) {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, data);
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath(`/product/${productId}`);
    revalidatePath('/admin/products');
    return { id: productId, ...data };
}

export async function deleteProduct(productId: string) {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin/products');
    return { success: true };
}
