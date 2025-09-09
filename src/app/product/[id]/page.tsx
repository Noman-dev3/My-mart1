
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare, ShoppingCart, Info } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { products } from '@/lib/placeholder-data';
import ProductRating from '@/components/product-rating';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ProductCard from '@/components/product-card';
import Link from 'next/link';
import { useMemo, useContext } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CartContext } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addToCart } = useContext(CartContext);
  const { toast } = useToast();

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  }, [product]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const imageVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header searchQuery="" setSearchQuery={() => {}} />
        <main className="flex-grow flex items-center justify-center text-center">
          <div>
            <h1 className="text-3xl font-bold font-headline">Product not found</h1>
            <p className="text-muted-foreground mt-2">Sorry, we couldn't find the product you're looking for.</p>
            <Button asChild className="mt-6">
              <Link href="/products">Go to Products</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header searchQuery="" setSearchQuery={() => {}} />
      <main className="flex-grow py-12 sm:py-16">
        <motion.div
          className="container mx-auto px-4 sm:px-6 lg:px-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div className="relative" variants={imageVariants}>
              <div className="aspect-square relative w-full overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  data-ai-hint="product image"
                />
              </div>
              {!product.inStock && (
                <motion.div
                  className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1.5 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 120 }}
                >
                  Out of Stock
                </motion.div>
              )}
            </motion.div>

            <div className="flex flex-col justify-center">
              <motion.p className="text-sm text-primary font-semibold" variants={itemVariants}>
                {product.category}
              </motion.p>
              <motion.h1 className="font-headline text-4xl md:text-5xl font-bold mt-2" variants={itemVariants}>
                {product.name}
              </motion.h1>
              <motion.div className="mt-4 flex items-center gap-4" variants={itemVariants}>
                <ProductRating rating={product.rating} totalReviews={product.reviews} />
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-muted-foreground">{product.brand}</span>
              </motion.div>
              <motion.p className="mt-6 text-lg text-muted-foreground" variants={itemVariants}>
                {product.description}
              </motion.p>

              <motion.div className="mt-8 flex flex-wrap items-center gap-6" variants={itemVariants}>
                <p className="text-4xl font-bold font-headline text-primary">${product.price.toFixed(2)}</p>
                <Button size="lg" disabled={!product.inStock} className="font-bold" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </motion.div>

              <motion.div className="mt-10" variants={itemVariants}>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="specifications">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2 font-headline text-lg">
                        <Info className="h-5 w-5" /> Product Specifications
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-muted-foreground mt-2">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <li key={key} className="flex justify-between">
                            <span className="font-medium text-foreground">{key}:</span>
                            <span>{value}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="reviews">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2 font-headline text-lg">
                        <MessageSquare className="h-5 w-5" /> Customer Reviews
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-6 mt-2">
                        {product.reviewsData.map((review, index) => (
                          <div key={index}>
                            <div className="flex items-center gap-2">
                              <ProductRating rating={review.rating} />
                              <p className="font-semibold">{review.author}</p>
                              <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                            </div>
                            <p className="text-muted-foreground mt-2">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <motion.section className="mt-24" variants={containerVariants}>
              <motion.h2 className="text-center font-headline text-3xl md:text-4xl font-bold mb-10" variants={itemVariants}>
                You Might Also Like
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedProducts.map((relatedProduct) => (
                  <motion.div key={relatedProduct.id} variants={itemVariants}>
                    <ProductCard product={relatedProduct} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
