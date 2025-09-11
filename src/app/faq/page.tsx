
'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type Faq = {
  question: string;
  answer: string;
};

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchFaqs = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('siteContent')
        .select('content')
        .eq('page', 'faq')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching FAQs:', error);
      } else if (data) {
        setFaqs((data.content as any).faqs || []);
      }
      setIsLoading(false);
    };
    fetchFaqs();
  }, [supabase]);

  const FaqSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-headline">Frequently Asked Questions</CardTitle>
            <CardDescription>Find answers to common questions about our products and services.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <FaqSkeleton /> : (
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
            
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
