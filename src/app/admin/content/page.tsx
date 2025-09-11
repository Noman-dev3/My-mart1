
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const heroSlideSchema = z.object({
  image: z.string().url({ message: "Please enter a valid URL." }),
  hint: z.string().min(1, { message: "AI hint is required." }),
  headline: z.string().min(1, { message: "Headline is required." }),
  subtext: z.string().min(1, { message: "Subtext is required." }),
});

const contentSchema = z.object({
  heroSlides: z.array(heroSlideSchema).length(3, "There must be exactly 3 hero slides."),
});

type ContentFormValues = z.infer<typeof contentSchema>;

export default function ContentPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      heroSlides: [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "heroSlides",
  });

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true);
      const docRef = doc(db, 'siteContent', 'homepage');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as ContentFormValues;
        if (data.heroSlides && data.heroSlides.length > 0) {
            form.reset(data);
        } else {
            // Pre-fill with some default structure if empty
            form.reset({
                heroSlides: [
                    { image: 'https://picsum.photos/1600/900?random=13', hint: 'fashion store', headline: 'Style Meets Simplicity', subtext: 'Discover curated collections of the finest products, delivered with speed and care.' },
                    { image: 'https://picsum.photos/1600/900?random=14', hint: 'electronics gadgets', headline: 'Tech for a Better Life', subtext: 'Explore the latest in cutting-edge technology.' },
                    { image: 'https://picsum.photos/1600/900?random=15', hint: 'modern furniture', headline: 'Elegance in Every Detail', subtext: 'Transform your space with our beautifully crafted home goods.' }
                ]
            })
        }
      }
      setIsLoading(false);
    }

    fetchContent();
  }, [form]);

  const onSubmit = async (data: ContentFormValues) => {
    try {
      const docRef = doc(db, 'siteContent', 'homepage');
      await setDoc(docRef, data, { merge: true });
      toast({
        title: 'Success!',
        description: 'Homepage content has been updated successfully.',
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
            <Card>
                <CardHeader>
                    <CardTitle>Homepage Hero Section</CardTitle>
                    <CardDescription>Update the rotating slides on your homepage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {fields.map((field, index) => (
                        <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                           <h3 className="font-headline text-lg font-semibold">Slide {index + 1}</h3>
                            <FormField
                                control={form.control}
                                name={`heroSlides.${index}.headline`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Headline</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="e.g., Style Meets Simplicity" />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`heroSlides.${index}.subtext`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Subtext</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="e.g., Discover curated collections..." />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`heroSlides.${index}.image`}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Image URL</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="https://picsum.photos/..." />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`heroSlides.${index}.hint`}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>AI Image Hint</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="e.g., fashion store" />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                             </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
