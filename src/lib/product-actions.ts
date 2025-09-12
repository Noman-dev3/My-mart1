
'use server';

import { z } from 'zod';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
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
    stockQuantity: number;
    barcode: string;
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
    created_at: any;
};

export async function getAllProducts(): Promise<{data: Product[] | null, error: any }> {
    const supabase = createServerActionClient({ cookies });
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
    
    return { data: data as Product[] | null, error };
}

export async function getProductById(productId: string): Promise<{ data: Product | null, error: any }> {
    const supabase = createServerActionClient({ cookies });
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
        
    return { data: data as Product | null, error };
}

export async function getProductByBarcode(barcode: string): Promise<{ data: Product | null, error: any }> {
    const supabase = createServerActionClient({ cookies });
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single();
    return { data: data as Product | null, error };
}

export async function getCategories(): Promise<string[]> {
    const supabase = createServerActionClient({ cookies });
    const { data, error } = await supabase
        .rpc('get_distinct_categories');
    
    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
    return data.map(item => item.category);
}

export async function getBrands(): Promise<string[]> {
    const supabase = createServerActionClient({ cookies });
    const { data, error } = await supabase
        .rpc('get_distinct_brands');

    if (error) {
        console.error("Error fetching brands:", error);
        return [];
    }
    return data.map(item => item.brand);
}


const productSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long."),
    description: z.string().min(10, "Description must be at least 10 characters long."),
    price: z.coerce.number().min(0, "Price must be a positive number."),
    image: z.string().url("Must be a valid image URL."),
    category: z.enum(['Electronics', 'Groceries', 'Fashion', 'Home Goods']),
    brand: z.string().min(2, "Brand must be at least 2 characters long."),
    stockQuantity: z.coerce.number().int("Stock must be a whole number."),
    barcode: z.string().min(8, "Barcode must be at least 8 characters long."),
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
    const supabase = createServerActionClient({ cookies });
    const newProduct = {
        ...data,
        rating: Math.floor(Math.random() * 5) + 1,
        reviews: Math.floor(Math.random() * 100),
        specifications: {},
        reviewsData: [],
        questions: [],
    };
    
    const { data: savedProduct, error } = await supabase
        .from('products')
        .insert(newProduct)
        .select()
        .single();
    
    if (error) throw error;
    
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');
    
    return savedProduct;
}

export async function updateProduct(productId: string, data: z.infer<typeof productSchema>) {
    const supabase = createServerActionClient({ cookies });
    const { data: updatedProduct, error } = await supabase
        .from('products')
        .update(data)
        .eq('id', productId)
        .select()
        .single();
    
    if (error) throw error;

    revalidatePath('/admin/products');
    revalidatePath(`/product/${productId}`);
    
    return updatedProduct;
}

export async function answerProductQuestion(productId: string, data: z.infer<typeof answerSchema>) {
    const supabase = createServerActionClient({ cookies });
    const { questionId, answer } = data;

    const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('questions')
        .eq('id', productId)
        .single();

    if (fetchError || !product) {
        throw new Error("Product not found");
    }

    const questions = (product.questions as Product['questions']) || [];
    const updatedQuestions = questions.map((q: any) => 
        q.id === questionId ? { ...q, answer } : q
    );
    
    const { error: updateError } = await supabase
        .from('products')
        .update({ questions: updatedQuestions })
        .eq('id', productId);

    if (updateError) throw updateError;
    
    revalidatePath(`/product/${productId}`);
    revalidatePath('/admin/products');

    return { success: true };
}

export async function askProductQuestion(data: z.infer<typeof questionSchema>) {
    const supabase = createServerActionClient({ cookies });
    const { productId, text, author, authorId } = questionSchema.parse(data);

    const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('questions')
        .eq('id', productId)
        .single();

     if (fetchError || !product) {
        return { success: false, error: "Product not found." };
    }

    const newQuestion = {
        id: randomBytes(8).toString('hex'), // simple unique id
        text,
        author,
        authorId,
        date: new Date().toISOString(),
    };
    
    const currentQuestions = product.questions || [];
    const updatedQuestions = [...currentQuestions, newQuestion];

    const { error: updateError } = await supabase
        .from('products')
        .update({ questions: updatedQuestions })
        .eq('id', productId);
    
    if (updateError) {
        console.error("Error submitting question:", updateError);
        return { success: false, error: "Failed to submit your question." };
    }
    
    revalidatePath(`/product/${productId}`);

    return { success: true, question: newQuestion };
}


export async function deleteProduct(productId: string) {
    const supabase = createServerActionClient({ cookies });
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
    
    if (error) throw error;
    
    revalidatePath('/admin/products');
    revalidatePath('/products');
    
    return { success: true };
}
