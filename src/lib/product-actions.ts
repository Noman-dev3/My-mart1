
'use server';

import { z } from 'zod';
import { db } from './firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, getDoc, arrayUnion } from 'firebase/firestore';
import { randomBytes } from 'crypto';

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
    questions: {
        id: string;
        author: string;
        authorId: string;
        text: string;
        date: string;
        answer?: string;
    }[];
    createdAt: any;
};

const productsCollection = collection(db, 'products');

const processProductDoc = (doc: any) => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        questions: data.questions || [],
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
    } as Product;
}

export async function getAllProducts(): Promise<Product[]> {
    const q = query(productsCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(processProductDoc);
}

export async function getProductById(productId: string): Promise<Product | undefined> {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (!productDoc.exists()) {
        return undefined;
    }
    return processProductDoc(productDoc);
}

export async function getCategories(): Promise<string[]> {
    const products = await getAllProducts();
    const categories = [...new Set(products.map((p) => p.category))];
    return categories;
}

export async function getBrands(): Promise<string[]> {
    const products = await getAllProducts();
    const brands = [...new Set(products.map((p) => p.brand))];
    return brands;
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

const answerSchema = z.object({
    questionId: z.string(),
    answer: z.string().min(1, "Answer cannot be empty."),
});

const questionSchema = z.object({
    productId: z.string(),
    text: z.string().min(10, "Question must be at least 10 characters.").max(500, "Question cannot be more than 500 characters."),
    author: z.string(),
    authorId: z.string(),
});


export async function addProduct(data: z.infer<typeof productSchema>) {
    const newProduct = {
        ...data,
        rating: Math.floor(Math.random() * 5) + 1,
        reviews: Math.floor(Math.random() * 100),
        specifications: {}, // Placeholder
        reviewsData: [], // Placeholder
        questions: [], // Initialize with empty questions
        createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(productsCollection, newProduct);
    const savedDoc = await getDoc(docRef);
    return processProductDoc(savedDoc);
}

export async function updateProduct(productId: string, data: z.infer<typeof productSchema>) {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, data);
    return { id: productId, ...data };
}

export async function answerProductQuestion(productId: string, data: z.infer<typeof answerSchema>) {
    const { questionId, answer } = data;
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
        throw new Error("Product not found");
    }

    const productData = productSnap.data();
    const questions = productData.questions || [];

    const updatedQuestions = questions.map((q: any) => 
        q.id === questionId ? { ...q, answer } : q
    );

    await updateDoc(productRef, { questions: updatedQuestions });
    return { success: true };
}

export async function askProductQuestion(data: z.infer<typeof questionSchema>) {
    const { productId, text, author, authorId } = questionSchema.parse(data);

    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
     if (!productSnap.exists()) {
        return { success: false, error: "Product not found." };
    }

    const newQuestion = {
        id: randomBytes(8).toString('hex'), // simple unique id
        text,
        author,
        authorId,
        date: new Date().toISOString(),
    };

    try {
        await updateDoc(productRef, {
            questions: arrayUnion(newQuestion)
        });
        return { success: true, question: newQuestion };
    } catch(error) {
        console.error("Error submitting question:", error);
        return { success: false, error: "Failed to submit your question." };
    }
}


export async function deleteProduct(productId: string) {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    return { success: true };
}
