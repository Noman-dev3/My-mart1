
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { type Product } from '@/lib/product-actions';
import ProductListing from '@/components/product-listing';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if(error) {
            console.error('Error fetching products', error);
        } else {
            setProducts(data as Product[]);
        }
    };
    fetchProducts();
  }, [supabase]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main className="flex-grow">
        <ProductListing products={products} searchQuery={searchQuery} />
      </main>
      <Footer />
    </div>
  );
}

    