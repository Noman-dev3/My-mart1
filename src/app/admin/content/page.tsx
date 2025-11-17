
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import RoleGate from '@/components/admin/role-gate';

const heroSlideSchema = z.object({
  image: z.string().url({ message: "Please enter a valid URL." }),
  hint: z.string().min(1, { message: "AI hint is required." }),
  headline: z.string().min(1, { message: "Headline is required." }),
  subtext: z.string().min(1, { message: "Subtext is required." }),
});

const faqItemSchema = z.object({
    question: z.string().min(1, "Question is required."),
    answer: z.string().min(1, "Answer is required."),
});

const contentSchema = z.object({
  heroSlides: z.array(heroSlideSchema).length(3, "There must be exactly 3 hero slides."),
  faqs: z.array(faqItemSchema),
  shippingReturns: z.string().min(1, "Content is required."),
});

type ContentFormValues = z.infer<typeof contentSchema>;

function ContentPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('homepage');
  const { toast } = useToast();
  const supabase = createSupabaseBrowserClient();

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      heroSlides: [],
      faqs: [],
      shippingReturns: ""
    },
  });

  const { fields: heroFields } = useFieldArray({ control: form.control, name: "heroSlides" });
  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({ control: form.control, name: "faqs" });

  useEffect(() => {
    async function fetchAllContent() {
      setIsLoading(true);
      const { data, error } = await supabase.from('siteContent').select('page, content');
      
      if (error) {
        console.error("Error fetching content:", error);
        toast({ title: 'Error', description: 'Failed to load site content.', variant: 'destructive'});
        setIsLoading(false);
        return;
      }

      const contentMap = data.reduce((acc, { page, content }) => {
        acc[page] = content;
        return acc;
      }, {} as Record<string, any>);

      const homepageContent = contentMap.homepage || {
        heroSlides: [
            { image: 'https://picsum.photos/seed/fashion1/1600/900', hint: 'fashion store', headline: 'Style Meets Simplicity', subtext: 'Discover curated collections of the finest products, delivered with speed and care.' },
            { image: 'https://picsum.photos/seed/tech1/1600/900', hint: 'electronics gadgets', headline: 'Tech for a Better Life', subtext: 'Explore the latest in cutting-edge technology.' },
            { image: 'https://picsum.photos/seed/home1/1600/900', hint: 'modern furniture', headline: 'Elegance in Every Detail', subtext: 'Transform your space with our beautifully crafted home goods.' }
        ]
      };

      const faqContent = contentMap.faq || {
        faqs: [
            { question: "What are your shipping options?", answer: "We offer standard shipping (3-5 business days) and express shipping (1-2 business days). All orders are shipped from our warehouse in Karachi." },
            { question: "How do I return an item?", answer: "You can return any item within 30 days of purchase. Please visit our Shipping & Returns page for detailed instructions on how to process a return." },
        ]
      };

      const shippingReturnsContent = contentMap.shippingReturns || {
        content: "We are committed to delivering your order accurately, in good condition, and always on time. We currently offer shipping only within Pakistan.\n\n**Standard Shipping:** 3-5 business days.\n**Express Shipping:** 1-2 business days.\n\nTo be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging."
      };
      
      form.reset({
        heroSlides: homepageContent.heroSlides,
        faqs: faqContent.faqs,
        shippingReturns: shippingReturnsContent.content
      });

      setIsLoading(false);
    }

    fetchAllContent();
  }, [form, supabase, toast]);

  const onSubmit = async (data: ContentFormValues) => {
    try {
      const operations = [
        supabase.from('siteContent').upsert({ page: 'homepage', content: { heroSlides: data.heroSlides } }, { onConflict: 'page' }),
        supabase.from('siteContent').upsert({ page: 'faq', content: { faqs: data.faqs } }, { onConflict: 'page' }),
        supabase.from('siteContent').upsert({ page: 'shippingReturns', content: { content: data.shippingReturns } }, { onConflict: 'page' }),
      ];

      const results = await Promise.all(operations);
      
      const hasError = results.some(res => res.error);
      if (hasError) {
        results.forEach(res => { if(res.error) console.error("Error saving content: ", res.error)});
        throw new Error("One or more content updates failed.");
      }
      
      toast({
        title: 'Success!',
        description: 'All site content has been updated successfully.',
      });
    } catch (error) {
      console.error("Failed to save content: ", error);
      toast({
        title: 'Error',
        description: 'Failed to save content. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Content Management</h1>
        <p className="text-muted-foreground">Edit the content for your website's main pages.</p>
      </div>
      
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="homepage">Homepage</TabsTrigger>
                    <TabsTrigger value="faq">FAQ</TabsTrigger>
                    <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
                </TabsList>

                <TabsContent value="homepage" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Homepage Hero Section</CardTitle>
                            <CardDescription>Update the rotating slides on your homepage.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {heroFields.map((field, index) => (
                                <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                                <h3 className="font-headline text-lg font-semibold">Slide {index + 1}</h3>
                                    <FormField control={form.control} name={`heroSlides.${index}.headline`} render={({ field }) => ( <FormItem> <FormLabel>Headline</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                    <FormField control={form.control} name={`heroSlides.${index}.subtext`} render={({ field }) => ( <FormItem> <FormLabel>Subtext</FormLabel> <FormControl><Textarea {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`heroSlides.${index}.image`} render={({ field }) => ( <FormItem> <FormLabel>Image URL</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                        <FormField control={form.control} name={`heroSlides.${index}.hint`} render={({ field }) => ( <FormItem> <FormLabel>AI Image Hint</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="faq" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Frequently Asked Questions</CardTitle>
                            <CardDescription>Manage the questions and answers on the FAQ page.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {faqFields.map((field, index) => (
                                <div key={field.id} className="space-y-4 p-4 border rounded-lg relative">
                                    <h3 className="font-headline text-lg font-semibold">Q&A #{index + 1}</h3>
                                    <FormField control={form.control} name={`faqs.${index}.question`} render={({ field }) => ( <FormItem> <FormLabel>Question</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                    <FormField control={form.control} name={`faqs.${index}.answer`} render={({ field }) => ( <FormItem> <FormLabel>Answer</FormLabel> <FormControl><Textarea {...field} rows={4} /></FormControl> <FormMessage /> </FormItem> )} />
                                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeFaq(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                             <Button type="button" variant="outline" onClick={() => appendFaq({ question: '', answer: '' })}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add FAQ Item
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="shipping" className="mt-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Shipping & Returns Page</CardTitle>
                            <CardDescription>Edit the content for the Shipping & Returns page. You can use simple markdown for formatting.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField control={form.control} name="shippingReturns" render={({ field }) => ( <FormItem> <FormLabel>Page Content</FormLabel> <FormControl><Textarea {...field} rows={15} /></FormControl> <FormMessage /> </FormItem> )} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save All Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default function ContentPage() {
    return (
        <RoleGate role="CONTENT_EDITOR">
            <ContentPageContent />
        </RoleGate>
    )
}
