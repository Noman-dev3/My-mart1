
'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { Skeleton } from '@/components/ui/skeleton';

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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-headline">Shipping & Returns</CardTitle>
            <CardDescription>Information about our shipping and return policies.</CardDescription>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
            {isLoading ? <ContentSkeleton /> : content ? (
              // Using a simple div with pre-wrap to render newlines from textarea.
              // A more robust solution would use a markdown parser.
              <div>{content}</div>
            ) : (
              <p>Content not available. Please check back later.</p>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
