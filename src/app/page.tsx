
'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, Zap, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product-card';
import { type Product } from '@/lib/product-actions';
import { useMemo, useRef, useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type HeroSlide = {
  image: string;
  hint: string;
  headline: string;
  subtext: string;
};


export default function LandingPage() {
  const [heroContent, setHeroContent] = useState<HeroSlide[] | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
      const fetchPageContent = async () => {
        setIsLoading(true);
        
        // Fetch hero content
        const { data: contentData, error: contentError } = await supabase
            .from('siteContent')
            .select('content')
            .eq('page', 'homepage')
            .single();

        if (contentError && contentError.code !== 'PGRST116') {
            console.error("Error fetching content:", contentError);
        }
        
        if (contentData) {
            const content = contentData.content as any;
            if (content.heroSlides && content.heroSlides.length > 0) {
              setHeroContent(content.heroSlides);
            }
        } else {
            // Fallback to some default content if nothing is in the database
            setHeroContent([
                { image: 'https://picsum.photos/1600/900?random=13', hint: 'fashion store', headline: 'Style Meets Simplicity', subtext: 'Discover curated collections of the finest products, delivered with speed and care. Your next favorite thing is just a click away.' },
                { image: 'https://picsum.photos/1600/900?random=14', hint: 'electronics gadgets', headline: 'Tech for a Better Life', subtext: 'Explore the latest in cutting-edge technology. High-performance gadgets to simplify and enhance your world.' },
                { image: 'https://picsum.photos/1600/900?random=15', hint: 'modern furniture', headline: 'Elegance in Every Detail', subtext: 'Transform your space with our beautifully crafted home goods. Where design and comfort live in perfect harmony.' },
            ]);
        }
        
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (productsError) {
            console.error("Failed to fetch products:", productsError);
        } else {
            setProducts(productsData as Product[]);
        }

        setIsLoading(false);
    };

    fetchPageContent();

    // No real-time subscription on homepage for performance reasons.
    // Data will be fresh on page load.

  }, [supabase]);


  useEffect(() => {
    if(!heroContent) return;
    const interval = setInterval(() => {
      setHeroIndex((prevIndex) => (prevIndex + 1) % heroContent.length);
    }, 7000); // Change hero content every 7 seconds
    return () => clearInterval(interval);
  }, [heroContent]);
  
  const featuredProducts = useMemo(() => products.slice(0, 3), [products]);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroTextOpacity = useTransform(heroScrollYProgress, [0, 0.5], [1, 0]);
  const heroTextY = useTransform(heroScrollYProgress, [0, 0.8], ['0%', '100%']);
  const heroImageX = useTransform(heroScrollYProgress, [0, 1], ['0%', '-50%']);

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

  const buttonVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
        delay: 0.4
      },
    },
  };

  const currentHero = heroContent?.[heroIndex];
  
  const HeroSkeleton = () => (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center text-center text-white overflow-hidden">
        <Skeleton className="absolute inset-0" />
        <div className="relative z-10 flex flex-col items-center">
            <Skeleton className="h-16 w-96 mb-4" />
            <Skeleton className="h-6 w-80" />
            <div className="flex gap-4 mt-8">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
            </div>
        </div>
    </section>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header searchQuery="" setSearchQuery={() => {}} />

      <main className="flex-grow">
        {/* Hero Section */}
        {isLoading || !currentHero ? <HeroSkeleton /> : (
        <motion.section
          ref={heroRef}
          className="relative h-screen min-h-[600px] flex items-center justify-center text-center text-white overflow-hidden"
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={heroIndex}
              className="absolute inset-0"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: '0%', opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  x: heroImageX,
                }}
              >
                <Image
                  src={currentHero.image}
                  alt="Hero background"
                  fill
                  className="object-cover"
                  quality={100}
                  priority
                  data-ai-hint={currentHero.hint}
                />
                <div className="absolute inset-0 bg-black/50" />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <motion.div 
            className="relative max-w-4xl px-4"
            style={{
                opacity: heroTextOpacity,
                y: heroTextY,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                 key={`text-${heroIndex}`}
                 initial="hidden"
                 animate="visible"
                 exit="hidden"
                 variants={containerVariants}
              >
                <motion.h1
                  className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight"
                  variants={itemVariants}
                >
                  {currentHero.headline}
                </motion.h1>
                <motion.p
                  className="mt-4 text-lg md:text-xl max-w-2xl mx-auto"
                  variants={itemVariants}
                >
                  {currentHero.subtext}
                </motion.p>
                <motion.div className="mt-8 flex justify-center gap-4" variants={buttonVariants}>
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
            </AnimatePresence>
          </motion.div>
        </motion.section>
        )}
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
              {isLoading ? Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-[450px] w-full" />) 
              : featuredProducts.map((product) => (
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

    