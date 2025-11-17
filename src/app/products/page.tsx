'use client';
import { useState, useEffect, Suspense } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { type Product } from '@/lib/product-actions';
import ProductListing from '@/components/product-listing';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { useSearchParams } from 'next/navigation';
import { Loader2, Apple, Banana, Carrot, Milk } from 'lucide-react';
import { motion } from 'framer-motion';

function ProductsPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching products', error);
      } else {
        setProducts(data as Product[]);
      }
      setIsLoading(false);
    };
    fetchProducts();
  }, [supabase]);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };
  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 120 },
    },
  };
  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-emerald-100 via-lime-100 to-yellow-100 text-gray-900">
      <Header />
      <main className="flex-1 relative overflow-hidden py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-[-20%] h-[150%] w-[150%] bg-[radial-gradient(circle_at_50%_50%,_rgba(236,255,224,0.6),_transparent)] opacity-70 animate-pulse-slow" />
          <div className="absolute right-[-10%] bottom-[-20%] h-[150%] w-[150%] bg-[radial-gradient(circle_at_50%_50%,_rgba(255,251,224,0.6),_transparent)] opacity-70 animate-pulse-slow delay-1000" />
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="mb-16 text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.h1 
              className="font-headline text-6xl font-extrabold leading-tight text-emerald-800 lg:text-8xl tracking-wide"
              variants={itemVariants}
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}
            >
              Adventure in Aisles!
            </motion.h1>
            <motion.p 
              className="mt-6 text-2xl text-lime-800 max-w-3xl mx-auto font-serif italic"
              variants={itemVariants}
            >
              Embark on a fun quest for fresh treasures, zesty deals, and yummy surprises! 🌟🍉
            </motion.p>
            <motion.div 
              className="mt-8 flex justify-center gap-8"
              variants={containerVariants}
            >
              {[Apple, Banana, Carrot, Milk].map((Icon, index) => (
                <motion.div
                  key={index}
                  variants={iconVariants}
                  className="text-emerald-500 animate-bounce"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <Icon className="h-16 w-16" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-16 w-16 animate-spin text-emerald-500" />
            </div>
          ) : (
            <motion.div 
              className="rounded-3xl bg-gradient-to-r from-lime-50/80 to-yellow-50/80 p-8 shadow-2xl backdrop-blur-lg border border-emerald-200/50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ProductListing products={products} />
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-emerald-100 via-lime-100 to-yellow-100 text-gray-900">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-emerald-500" />
          </main>
          <Footer />
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}