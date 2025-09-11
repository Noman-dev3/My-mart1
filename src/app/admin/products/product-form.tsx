'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import type { Product } from "@/lib/product-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { answerProductQuestion } from "@/lib/product-actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const productFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  image: z.string().url("Must be a valid image URL."),
  category: z.enum(['Electronics', 'Groceries', 'Fashion', 'Home Goods']),
  brand: z.string().min(2, "Brand must be at least 2 characters long."),
  inStock: z.boolean(),
});

type ProductFormValues = z.infer<typeof productFormSchema>

type ProductFormProps = {
    onSubmit: (values: ProductFormValues) => Promise<any>;
    onCancel: () => void;
    product?: Product;
}

export default function ProductForm({ onSubmit, onCancel, product }: ProductFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
        name: product?.name || "",
        description: product?.description || "",
        price: product?.price || 0,
        image: product?.image || "",
        category: product?.category || "Electronics",
        brand: product?.brand || "",
        inStock: product?.inStock ?? true,
    },
  });

  const handleAnswerSubmit = async (questionId: string, answer: string) => {
    if (!product) return;
    try {
      await answerProductQuestion(product.id, { questionId, answer });
      toast({ title: "Success", description: "Answer submitted successfully." });
      // Here you might want to trigger a refresh of the product data
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit answer.", variant: "destructive" });
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="details">Product Details</TabsTrigger>
        <TabsTrigger value="qa" disabled={!product}>Q&A</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Wireless Headphones" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="High-fidelity wireless headphones..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price (PKR)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="49999" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Groceries">Groceries</SelectItem>
                            <SelectItem value="Fashion">Fashion</SelectItem>
                            <SelectItem value="Home Goods">Home Goods</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input placeholder="SoundWave" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://picsum.photos/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="inStock"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>In Stock</FormLabel>
                        <FormDescription>
                        Is this product available for purchase?
                        </FormDescription>
                    </div>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    </FormItem>
                )}
            />
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Product'}
                </Button>
            </div>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="qa">
        <div className="space-y-6 mt-4">
            <h3 className="text-lg font-medium">Product Questions</h3>
            {(product?.questions?.length || 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No questions have been asked for this product yet.</p>
            ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {product?.questions?.map(q => (
                        <QAndAItem key={q.id} question={q} onAnswerSubmit={handleAnswerSubmit} />
                    ))}
                </div>
            )}
        </div>
      </TabsContent>
    </Tabs>
  )
}

const QAndAItem = ({ question, onAnswerSubmit }: { question: Product['questions'][0], onAnswerSubmit: (questionId: string, answer: string) => Promise<void> }) => {
    const [answer, setAnswer] = useState(question.answer || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onAnswerSubmit(question.id, answer);
        setIsSubmitting(false);
    }
    
    return (
        <div className="p-4 border rounded-lg">
            <p className="text-sm font-semibold">{question.text}</p>
            <p className="text-xs text-muted-foreground">From: {question.author} on {new Date(question.date).toLocaleDateString()}</p>
            {question.answer && (
                <p className="text-sm mt-2 pt-2 border-t text-green-700 bg-green-50 p-2 rounded-md">
                    <strong>A:</strong> {question.answer}
                </p>
            )}
            {!question.answer && (
                 <form onSubmit={handleSubmit} className="mt-2 pt-2 border-t">
                    <Textarea 
                        placeholder="Type your answer here..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="mt-2"
                    />
                    <Button type="submit" size="sm" className="mt-2" disabled={isSubmitting || !answer}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Answer'}
                    </Button>
                 </form>
            )}
        </div>
    )
}
