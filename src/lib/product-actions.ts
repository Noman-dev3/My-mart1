
'use server';

import { z } from 'zod';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'crypto';
import { productSchema } from './schemas';
import type { ProductFormValues } from './schemas';

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
    created_at: string;
};

export type { ProductFormValues };


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


export async function addProduct(values: ProductFormValues) {
    const supabase = createServerActionClient({ cookies });
    
    try {
        const validatedData = productSchema.parse(values);

        const newProduct = {
            name: validatedData.name,
            description: validatedData.description,
            price: validatedData.price,
            image: validatedData.image,
            category: validatedData.category,
            brand: validatedData.brand,
            stockQuantity: validatedData.stockQuantity,
            barcode: validatedData.barcode,
            specifications: validatedData.specifications || {},
            reviewsData: validatedData.reviewsData || [],
            questions: validatedData.questions || [],
            rating: 0, // Explicitly set default
            reviews: 0, // Explicitly set default
            created_at: new Date().toISOString(), // Explicitly set timestamp
        };

        const { data: savedProduct, error } = await supabase
            .from('products')
            .insert(newProduct)
            .select()
            .single();
        
        if (error) {
            throw error;
        }
        
        revalidatePath('/admin/products');
        revalidatePath('/products');
        revalidatePath('/');
        
        return savedProduct as Product;

    } catch (error: any) {
        if (error.code === '23505') { // Unique violation error code for PostgreSQL
             throw new Error("A product with this barcode already exists.");
        }
        console.error('Database error saving product:', error);
        throw new Error("Could not save product due to a database error.");
    }
}

export async function updateProduct(productId: string, values: ProductFormValues) {
    const supabase = createServerActionClient({ cookies });
    
    try {
        const validatedData = productSchema.parse(values);
        
        const updateData = {
            name: validatedData.name,
            description: validatedData.description,
            price: validatedData.price,
            image: validatedData.image,
            category: validatedData.category,
            brand: validatedData.brand,
            stockQuantity: validatedData.stockQuantity,
            barcode: validatedData.barcode,
            specifications: validatedData.specifications || {},
            reviewsData: values.reviewsData || [], // Preserve existing data
            questions: values.questions || [] // Preserve existing data
        };

        const { data: updatedProduct, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', productId)
            .select()
            .single();
        
        if (error) {
            throw error;
        };

        revalidatePath('/admin/products');
        revalidatePath(`/product/${productId}`);
        
        return updatedProduct;

    } catch (error: any) {
         if (error.code === '23505') { // Unique violation error code for PostgreSQL
             throw new Error("A product with this barcode already exists.");
        }
        console.error('Database error updating product:', error);
        throw new Error("Could not update product due to a database error.");
    }
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
