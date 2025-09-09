'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ShoppingBag, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product-card';
import { products } from '@/lib/placeholder-data';
import { useMemo, useRef } from 'react';

export default function LandingPage() {
  const featuredProducts = useMemo(() => products.slice(0, 3), []);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroTextOpacity = useTransform(heroScrollYProgress, [0, 0.8], [1, 0]);
  const heroTextY = useTransform(heroScrollYProgress, [0, 0.5], ['0%', '50%']);
  const heroImageScale = useTransform(heroScrollYProgress, [0, 1], [1, 1.2]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header searchQuery="" setSearchQuery={() => {}} />

      <main className="flex-grow">
        {/* Hero Section */}
        <motion.section
          ref={heroRef}
          className="relative h-screen min-h-[600px] flex items-center justify-center text-center text-white overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 -z-10"
            style={{
              scale: heroImageScale,
            }}
          >
            <Image
              src="https://picsum.photos/1600/900?random=13"
              alt="Hero background"
              fill
              className="object-cover"
              quality={100}
              priority
              data-ai-hint="fashion store"
            />
             <div className="absolute inset-0 bg-black/50" />
          </motion.div>
          <motion.div 
            className="max-w-4xl px-4"
            style={{
                opacity: heroTextOpacity,
                y: heroTextY,
            }}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.h1
              className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight"
              variants={itemVariants}
            >
              Style Meets Simplicity
            </motion.h1>
            <motion.p
              className="mt-4 text-lg md:text-xl max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Discover curated collections of the finest products, delivered with speed and care. Your next favorite thing is just a click away.
            </motion.p>
            <motion.div className="mt-8 flex justify-center gap-4" variants={itemVariants}>
              <Button asChild size="lg" className="font-bold">
                <Link href="/products">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="font-bold">
                <Link href="#featured">
                  See Featured
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          className="py-16 sm:py-24 bg-muted/30"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <motion.div className="flex flex-col items-center" variants={itemVariants}>
                <ShoppingBag className="h-12 w-12 text-primary" />
                <h3 className="mt-4 font-headline text-2xl font-semibold">Curated Selection</h3>
                <p className="mt-2 text-muted-foreground">Hand-picked products from the best brands around the world.</p>
              </motion.div>
              <motion.div className="flex flex-col items-center" variants={itemVariants}>
                <Zap className="h-12 w-12 text-primary" />
                <h3 className="mt-4 font-headline text-2xl font-semibold">Fast Delivery</h3>
                <p className="mt-2 text-muted-foreground">Get your order delivered to your doorstep in record time.</p>
              </motion.div>
              <motion.div className="flex flex-col items-center" variants={itemVariants}>
                <ArrowRight className="h-12 w-12 text-primary" />
                <h3 className="mt-4 font-headline text-2xl font-semibold">Easy Returns</h3>
                <p className="mt-2 text-muted-foreground">Hassle-free returns and exchanges within 30 days.</p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Featured Products Section */}
        <motion.section
          id="featured"
          className="py-16 sm:py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 className="text-center font-headline text-4xl md:text-5xl font-bold mb-12" variants={itemVariants}>
              Featured Products
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
            <motion.div className="text-center mt-12" variants={itemVariants}>
              <Button asChild size="lg">
                <Link href="/products">
                  View All Products <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
