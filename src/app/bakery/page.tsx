
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { type Product } from '@/lib/product-actions';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { Loader2 } from 'lucide-react';
import BakeryProductCard from '@/components/bakery-product-card';

export default function BakeryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchBakeryProducts = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('category', 'Bakery')
            .order('created_at', { ascending: false });

        if(error) {
            console.error('Error fetching bakery products', error);
        } else {
            setProducts(data as Product[]);
        }
        setIsLoading(false);
    };
    fetchBakeryProducts();
  }, [supabase]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
            <h1 className="text-5xl font-bold font-headline">The Bakery</h1>
            <p className="text-lg text-muted-foreground mt-2">Freshly made custom orders. Please allow 24-48 hours for preparation.</p>
        </div>

        {isLoading ? (
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : products.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <BakeryProductCard key={product.id} product={product} />
              ))}
            </div>
        ) : (
            <div className="text-center py-20">
              <h3 className="font-headline text-2xl font-semibold">No Bakery Items Available</h3>
              <p className="text-muted-foreground mt-2">Please check back later for our delicious custom offerings.</p>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
