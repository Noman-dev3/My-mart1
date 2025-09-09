'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { products } from '@/lib/placeholder-data';
import ProductListing from '@/components/product-listing';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');

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
