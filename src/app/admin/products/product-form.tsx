
'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Product } from "@/lib/product-actions";
import { productSchema, type ProductFormValues } from "@/lib/schemas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { answerProductQuestion } from "@/lib/product-actions";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, RefreshCw, ScanLine } from "lucide-react";
import { getProductQuestionAnswer } from "@/ai/flows/answer-product-question"
import BarcodeScanner from "./barcode-scanner"

type ProductFormProps = {
    onSubmit: (values: ProductFormValues) => Promise<any>;
    onCancel: () => void;
    product?: Product;
}

export default function ProductForm({ onSubmit, onCancel, product }: ProductFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
        name: "",
        description: "",
        price: 0,
        image: "",
        category: "Electronics",
        brand: "",
        stockQuantity: 0,
        barcode: "",
        specifications: {},
        reviewsData: [],
        questions: [],
    }
  });

  useEffect(() => {
    if (product) {
      form.reset(product);
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        image: 'https://picsum.photos/seed/product/600/600',
        category: 'Electronics',
        brand: '',
        stockQuantity: 0,
        barcode: '',
        specifications: {},
        reviewsData: [],
        questions: [],
      });
    }
  }, [product, form]);

  const handleAnswerSubmit = async (questionId: string, answer: string) => {
    if (!product) return;
    try {
      await answerProductQuestion(product.id, { questionId, answer });
      toast({ title: "Success", description: "Answer submitted successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit answer.", variant: "destructive" });
    }
  };

  const generateBarcode = () => {
    const randomDigits = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    form.setValue('barcode', randomDigits, { shouldValidate: true });
    toast({ title: "Barcode Generated", description: "A new unique barcode has been generated."})
  }

  const handleBarcodeScanned = (barcode: string) => {
    form.setValue('barcode', barcode, { shouldValidate: true });
    setIsScannerOpen(false);
    toast({ title: "Barcode Scanned", description: `Barcode set to: ${barcode}`});
  }

  const onFormSubmit = async (values: ProductFormValues) => {
    const dataToSubmit = {
      ...values,
      specifications: values.specifications || {},
    };
    const result = await onSubmit(dataToSubmit);
    if (result) {
      onCancel();
    }
  };

  return (
    <>
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="details">Product Details</TabsTrigger>
        <TabsTrigger value="qa" disabled={!product}>Q&A</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto pr-2">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="e.g., 123456789012" {...field} />
                        </FormControl>
                        <Button type="button" variant="outline" size="icon" onClick={() => setIsScannerOpen(true)}>
                          <ScanLine className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="outline" size="icon" onClick={generateBarcode}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

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
            
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Save Product'}
                </Button>
            </div>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="qa">
        <div className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto pr-2">
            <h3 className="text-lg font-medium">Product Questions</h3>
            {(product?.questions?.length || 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No questions have been asked for this product yet.</p>
            ) : (
                <div className="space-y-4">
                    {product?.questions?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(q => (
                        <QAndAItem key={q.id} product={product} question={q} onAnswerSubmit={handleAnswerSubmit} />
                    ))}
                </div>
            )}
        </div>
      </TabsContent>
    </Tabs>
    
    <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Scan Barcode</DialogTitle>
                <DialogDescription>
                    Position the barcode within the camera view to scan it.
                </DialogDescription>
            </DialogHeader>
            <BarcodeScanner 
                onScan={handleBarcodeScanned} 
                onClose={() => setIsScannerOpen(false)}
            />
        </DialogContent>
    </Dialog>
    </>
  )
}

const QAndAItem = ({ product, question, onAnswerSubmit }: { product: Product, question: Product['questions'][0], onAnswerSubmit: (questionId: string, answer: string) => Promise<void> }) => {
    const [answer, setAnswer] = useState(question.answer || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onAnswerSubmit(question.id, answer);
        setIsSubmitting(false);
    }
    
    const handleGenerateAnswer = async () => {
        setIsGenerating(true);
        try {
            const { specifications, name, description, category, brand } = product;
            const result = await getProductQuestionAnswer({
                product: { name, description, category, brand, specifications: specifications || {} },
                question: question.text
            });
            setAnswer(result.answer);
        } catch(e) {
            console.error(e);
            toast({ title: "AI Generation Failed", description: "Could not generate an answer.", variant: "destructive"});
        } finally {
            setIsGenerating(false);
        }
    }
    
    return (
        <div className="p-4 border rounded-lg">
            <p className="text-sm font-semibold">{question.text}</p>
            <p className="text-xs text-muted-foreground">From: {question.author} on {new Date(question.date).toLocaleDateString()}</p>
            {question.answer ? (
                <p className="text-sm mt-2 pt-2 border-t text-green-700 bg-green-50 p-2 rounded-md dark:text-green-300 dark:bg-green-900/30">
                    <strong>A:</strong> {question.answer}
                </p>
            ) : (
                 <form onSubmit={handleSubmit} className="mt-2 pt-2 border-t">
                    <Textarea 
                        placeholder="Type your answer here..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="mt-2"
                        disabled={isSubmitting}
                    />
                    <div className="mt-2 flex justify-between items-center">
                        <Button type="submit" size="sm" disabled={isSubmitting || isGenerating || !answer}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Answer'}
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={handleGenerateAnswer} disabled={isSubmitting || isGenerating}>
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : '✨'}
                            AI Assist
                        </Button>
                    </div>
                 </form>
            )}
        </div>
    )
}
