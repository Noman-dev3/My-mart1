
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { getProducts as fetchProducts, type Product } from '@/lib/placeholder-data';
import ProductListing from '@/components/product-listing';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
        const fetched = await fetchProducts();
        setProducts(fetched);
    }
    loadProducts();
  }, [])

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
