
'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Truck, Undo2, Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ShippingReturnsPage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('siteContent')
        .select('content')
        .eq('page', 'shippingReturns')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching shipping/returns content:', error);
      } else if (data) {
        setContent((data.content as any).content || '');
      }
      setIsLoading(false);
    };
    fetchContent();
  }, [supabase]);

  const ContentSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <br/>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      <div className="flex-grow">
         <div className="bg-background">
            <div className="container mx-auto px-4 py-16 text-center">
                <Package className="mx-auto h-16 w-16 text-primary" />
                <h1 className="mt-4 text-4xl font-extrabold font-headline tracking-tight lg:text-5xl">
                    Shipping & Returns
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Everything you need to know about delivery and returns.
                </p>
            </div>
        </div>

        <main className="container mx-auto px-4 py-12 -mt-16">
          <Card className="max-w-4xl mx-auto shadow-xl">
            <CardContent className="p-6 md:p-10">
              <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                      <h2 className="text-2xl font-headline font-semibold flex items-center gap-2"><Truck className="h-6 w-6 text-primary" /> Shipping Policy</h2>
                      <p className="text-muted-foreground">We are committed to delivering your order accurately, in good condition, and always on time. We currently offer shipping across Pakistan.</p>
                      <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                          <li><span className="font-semibold text-foreground">Standard Shipping:</span> 3-5 business days.</li>
                          <li><span className="font-semibold text-foreground">Express Shipping:</span> 1-2 business days.</li>
                          <li>Orders are dispatched from our warehouse in Karachi.</li>
                      </ul>
                  </div>

                  <div className="space-y-4">
                      <h2 className="text-2xl font-headline font-semibold flex items-center gap-2"><Undo2 className="h-6 w-6 text-primary" /> Return Policy</h2>
                      <p className="text-muted-foreground">To be eligible for a return, your item must be unused, in the same condition that you received it, and in the original packaging. Returns are accepted within 30 days of purchase.</p>
                      <p className="text-muted-foreground">To initiate a return, please contact our support team with your order number.</p>
                  </div>
              </div>
              <Separator className="my-8" />
               <div>
                  <h3 className="text-xl font-headline font-semibold text-center mb-4">Detailed Information</h3>
                  <div className="prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                      {isLoading ? <ContentSkeleton /> : content ? (
                          <div>{content}</div>
                      ) : (
                          <p>Detailed policy content not available. Please check back later.</p>
                      )}
                  </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      <Footer />
    </div>
  );
}
