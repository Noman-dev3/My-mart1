
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare, ShoppingCart, Info, Loader2, HelpCircle } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { getProductById, type Product, askProductQuestion } from '@/lib/product-actions';
import ProductRating from '@/components/product-rating';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ProductCard from '@/components/product-card';
import { useState, useEffect, useContext } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CartContext } from '@/context/cart-context';
import { AuthContext } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getProductRecommendations } from '@/ai/flows/product-recommendations';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

const questionFormSchema = z.object({
  text: z.string().min(10, "Question must be at least 10 characters.").max(500, "Question must be at most 500 characters."),
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);

  const { addToCart } = useContext(CartContext);
  const { user, loading: userLoading } = useContext(AuthContext);
  const { toast } = useToast();

  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoadingProduct(true);
    const productDocRef = doc(db, 'products', id as string);
    const unsubscribe = onSnapshot(productDocRef, (doc) => {
        if(doc.exists()){
            setProduct({ id: doc.id, ...doc.data() } as Product);
        } else {
            setProduct(undefined)
        }
        setIsLoadingProduct(false);
    });

    return () => unsubscribe();
  }, [id]);


  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setAllProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }, (error) => console.error("Failed to listen to all products:", error));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!product || allProducts.length === 0) return;
      setIsLoadingRecommendations(true);
      try {
        const { recommendedProductIds } = await getProductRecommendations({ productId: product.id });
        const recommendations = allProducts.filter(p => recommendedProductIds.includes(p.id) && p.id !== product.id);
        setRecommendedProducts(recommendations.slice(0,3));
      } catch (error) {
        console.error("Failed to get AI recommendations:", error);
        // Fallback to category-based recommendations on error
        const categoryProducts = allProducts
            .filter((p) => p.category === product.category && p.id !== product.id)
            .slice(0, 3);
        setRecommendedProducts(categoryProducts);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [product, allProducts]);

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
  
  const handleQuestionSubmitted = () => {
    toast({
        title: "Question Submitted!",
        description: "Your question has been sent and will be answered shortly."
    });
  }

  if (isLoadingProduct) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header searchQuery="" setSearchQuery={() => {}} />
        <main className="flex-grow flex items-center justify-center text-center">
          <div>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h1 className="text-3xl font-bold font-headline mt-4">Loading Product...</h1>
            <p className="text-muted-foreground mt-2">Please wait a moment.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
      return (
         <div className="flex flex-col min-h-screen">
            <Header searchQuery="" setSearchQuery={() => {}} />
            <main className="flex-grow flex items-center justify-center text-center">
            <div>
                <h1 className="text-3xl font-bold font-headline mt-4">Product Not Found</h1>
                <p className="text-muted-foreground mt-2">We couldn't find the product you're looking for.</p>
                <Button asChild className="mt-4">
                    <Link href="/products">Go to Products</Link>
                </Button>
            </div>
            </main>
            <Footer />
        </div>
      )
  }

  const RecommendationsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => (
        <motion.div key={i} variants={itemVariants}>
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const answeredQuestions = product.questions?.filter(q => q.answer).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

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
                <p className="text-4xl font-bold font-headline text-primary">PKR {product.price.toFixed(2)}</p>
                <Button size="lg" disabled={!product.inStock} className="font-bold" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </motion.div>

              <motion.div className="mt-10" variants={itemVariants}>
                <Accordion type="single" collapsible className="w-full" defaultValue="specifications">
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
                            <span>{String(value)}</span>
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
                         {product.reviewsData.length === 0 && (
                            <p className="text-sm text-muted-foreground">No reviews yet.</p>
                         )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="qa">
                    <AccordionTrigger>
                    <div className="flex items-center gap-2 font-headline text-lg">
                        <HelpCircle className="h-5 w-5" /> Questions &amp; Answers
                    </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        {answeredQuestions.length > 0 ? (
                            <div className="space-y-6 mt-2">
                                {answeredQuestions.map((qa) => (
                                    <div key={qa.id}>
                                        <p className="font-semibold text-foreground">Q: {qa.text}</p>
                                        <p className="text-muted-foreground mt-1 ml-4">A: {qa.answer}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground mt-2">No answered questions yet. Be the first to ask!</p>
                        )}
                        
                        <Separator className="my-6"/>

                        {!userLoading && (
                            user ? (
                                <QuestionForm productId={product.id} productName={product.name} user={user} onQuestionSubmitted={handleQuestionSubmitted}/>
                            ) : (
                                <div className="text-center bg-muted/50 p-4 rounded-md">
                                    <p className="text-sm text-muted-foreground">You must be logged in to ask a question.</p>
                                    <Button asChild variant="link" className="p-0 h-auto">
                                        <Link href={`/login?redirect=/product/${product.id}`}>
                                            Login or Sign Up
                                        </Link>
                                    </Button>
                                </div>
                            )
                        )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            </div>
          </div>

          <motion.section className="mt-24" variants={containerVariants}>
            <motion.h2 className="text-center font-headline text-3xl md:text-4xl font-bold mb-10" variants={itemVariants}>
              You Might Also Like
            </motion.h2>
            {isLoadingRecommendations ? (
              <RecommendationsSkeleton />
            ) : recommendedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendedProducts.map((relatedProduct) => (
                  <motion.div key={relatedProduct.id} variants={itemVariants}>
                    <ProductCard product={relatedProduct} />
                  </motion.div>
                ))}
              </div>
            ) : null}
          </motion.section>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

function QuestionForm({ productId, productName, user, onQuestionSubmitted }: { productId: string, productName: string, user: any, onQuestionSubmitted: () => void }) {
    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionFormSchema),
        defaultValues: { text: "" }
    });

    const { toast } = useToast();

    const onSubmit = async (values: QuestionFormValues) => {
        const result = await askProductQuestion({
            productId,
            text: values.text,
            author: user.user_metadata.full_name || user.email,
            authorId: user.id,
        });

        if (result.success) {
            form.reset();
            onQuestionSubmitted();
        } else {
            toast({
                title: "Submission Failed",
                description: result.error,
                variant: 'destructive'
            });
            form.setError("text", { type: "server", message: result.error });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <h4 className="font-headline font-semibold">Ask a New Question</h4>
                <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea placeholder={`Ask a question about the ${productName}...`} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="animate-spin mr-2"/> : null}
                    Submit Question
                </Button>
            </form>
        </Form>
    );
}
