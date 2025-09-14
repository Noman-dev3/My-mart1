
'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { Loader2, HelpCircle, LifeBuoy, ShieldQuestion } from 'lucide-react';
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
  );

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      <div className="flex-grow">
        <div className="bg-background">
          <div className="container mx-auto px-4 py-16 text-center">
            <HelpCircle className="mx-auto h-16 w-16 text-primary" />
            <h1 className="mt-4 text-4xl font-extrabold font-headline tracking-tight lg:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.
            </p>
          </div>
        </div>

        <main className="container mx-auto px-4 py-12 -mt-16">
          <Card className="max-w-4xl mx-auto shadow-xl">
            <CardContent className="p-6 md:p-8">
              {isLoading ? <FaqSkeleton /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h2 className="text-2xl font-headline font-semibold flex items-center gap-2"><LifeBuoy className="h-6 w-6 text-primary" /> Order & Shipping</h2>
                    <Accordion type="single" collapsible className="w-full">
                      {faqs.slice(0, Math.ceil(faqs.length / 2)).map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                          <AccordionTrigger>{faq.question}</AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                   <div className="space-y-6">
                     <h2 className="text-2xl font-headline font-semibold flex items-center gap-2"><ShieldQuestion className="h-6 w-6 text-primary" /> Products & Returns</h2>
                    <Accordion type="single" collapsible className="w-full">
                      {faqs.slice(Math.ceil(faqs.length / 2)).map((faq, index) => (
                        <AccordionItem value={`item-b-${index}`} key={index}>
                          <AccordionTrigger>{faq.question}</AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      <Footer />
    </div>
  );
}
