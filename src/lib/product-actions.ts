
'use server';

import { z } from 'zod';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'crypto';
import { productFormSchema, type ProductFormValues } from './schemas';

// We define the Product type here as this file is the source of truth for product data structures.
export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: 'Electronics' | 'Groceries' | 'Fashion' | 'Home Goods' | 'Bakery';
    brand: string;
    stock_quantity: number;
    barcode: string;
    rating: number;
    reviews: number;
    specifications: Record<string, string>;
    reviews_data: {
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

export async function uploadProductImage(formData: FormData) {
  // Use the service role client for direct uploads, bypassing RLS.
  // This is secure because this is a server action.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const file = formData.get('file') as File;

  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const filePath = `public/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Image upload error:', uploadError);
    throw new Error('Failed to upload image to storage.');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return { publicUrl };
}


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

const reviewSchema = z.object({
    productId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().min(10, "Comment must be at least 10 characters.").max(1000, "Comment cannot be more than 1000 characters."),
    author: z.string(),
    authorId: z.string(),
});


export async function addProduct(values: ProductFormValues) {
    const supabase = createServerActionClient({ cookies });
    
    try {
        const validatedData = productFormSchema.parse(values);

        const specificationsObject = (validatedData.specifications || []).reduce((acc, spec) => {
            if (spec.key && spec.value) acc[spec.key] = spec.value;
            return acc;
        }, {} as Record<string, string>);

        const newProduct = {
            name: validatedData.name,
            description: validatedData.description,
            price: validatedData.price,
            image: validatedData.image || `https://picsum.photos/seed/${validatedData.name.replace(/\s+/g, '-')}/600/600`,
            category: validatedData.category,
            brand: validatedData.brand,
            stock_quantity: validatedData.stock_quantity,
            barcode: validatedData.barcode,
            specifications: specificationsObject,
            rating: 0,
            reviews: 0,
            reviews_data: [],
            questions: []
        };

        const { data: savedProduct, error } = await supabase
            .from('products')
            .insert(newProduct)
            .select()
            .single();
        
        if (error) {
            console.error('Database error saving product:', error);
            if (error.code === '23505') { 
                 throw new Error("A product with this barcode already exists.");
            }
            throw new Error("Could not save product due to a database error.");
        }
        
        revalidatePath('/admin/products');
        revalidatePath('/products');
        revalidatePath('/');
        
        return savedProduct as Product;

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            console.error("Validation error:", error.issues);
            throw new Error("Validation failed. Please check the form fields.");
        }
        throw error;
    }
}

export async function updateProduct(productId: string, values: ProductFormValues) {
    const supabase = createServerActionClient({ cookies });
    
    try {
        const validatedData = productFormSchema.parse(values);
        
        const specificationsObject = (validatedData.specifications || []).reduce((acc, spec) => {
            if (spec.key && spec.value) acc[spec.key] = spec.value;
            return acc;
        }, {} as Record<string, string>);

        const updateData = {
            name: validatedData.name,
            description: validatedData.description,
            price: validatedData.price,
            image: validatedData.image || `https://picsum.photos/seed/${validatedData.name.replace(/\s+/g, '-')}/600/600`,
            category: validatedData.category,
            brand: validatedData.brand,
            stock_quantity: validatedData.stock_quantity,
            barcode: validatedData.barcode,
            specifications: specificationsObject
        };

        const { data: updatedProduct, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', productId)
            .select()
            .single();
        
        if (error) {
            console.error('Database error updating product:', error);
             if (error.code === '23505') { 
                throw new Error("A product with this barcode already exists.");
            }
            throw new Error("Could not update product due to a database error.");
        };

        revalidatePath('/admin/products');
        revalidatePath(`/product/${productId}`);
        
        return updatedProduct;

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            console.error("Validation error:", error.issues);
            throw new Error("Validation failed. Please check the form fields.");
        }
        throw error;
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


export async function addProductReview(data: z.infer<typeof reviewSchema>) {
    const supabase = createServerActionClient({ cookies });
    const { productId, rating, comment, author, authorId } = reviewSchema.parse(data);
    
    const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('reviews_data, rating, reviews')
        .eq('id', productId)
        .single();

    if (fetchError || !product) {
        return { success: false, error: "Product not found." };
    }
    
    const currentReviews = (product.reviews_data as Product['reviews_data']) || [];

    // Optional: Prevent duplicate reviews
    if (currentReviews.some(review => review.author === author)) {
        return { success: false, error: "You have already submitted a review for this product." };
    }

    const newReview = {
        author,
        rating,
        comment,
        date: new Date().toISOString(),
    };

    const updatedReviews = [...currentReviews, newReview];
    const newTotalReviews = updatedReviews.length;
    const newAverageRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / newTotalReviews;

    const { error: updateError } = await supabase
        .from('products')
        .update({
            reviews_data: updatedReviews,
            reviews: newTotalReviews,
            rating: newAverageRating,
        })
        .eq('id', productId);

    if (updateError) {
        console.error("Error adding review:", updateError);
        return { success: false, error: "Failed to add your review." };
    }

    revalidatePath(`/product/${productId}`);

    return { success: true };
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
