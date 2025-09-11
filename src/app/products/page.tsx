
'use client';

import { useState, useEffect, Suspense } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { type Product } from '@/lib/product-actions';
import ProductListing from '@/components/product-listing';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function ProductsPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();
  const searchParams = useSearchParams();
  const category = searchParams.get('category');

  useEffect(() => {
    const fetchProducts = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if(error) {
            console.error('Error fetching products', error);
        } else {
            setProducts(data as Product[]);
        }
        setIsLoading(false);
    };
    fetchProducts();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main className="flex-grow">
        <ProductListing products={products} searchQuery={searchQuery} initialCategory={category} />
      </main>
    </>
  );
}


export default function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }>
        <ProductsPageContent />
      </Suspense>
      <Footer />
    </div>
  );
}
