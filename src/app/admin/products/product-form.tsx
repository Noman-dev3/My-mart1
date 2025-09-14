
'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
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
import { answerProductQuestion, uploadProductImage } from "@/lib/product-actions";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { Loader2, RefreshCw, ScanLine, Upload, PlusCircle, Trash2, Wand2 } from "lucide-react";
import { getProductQuestionAnswer } from "@/ai/flows/answer-product-question"
import { generateProductDescription } from "@/ai/flows/generate-product-description"
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
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
        name: "",
        description: "",
        price: 0,
        image: "",
        category: "Electronics",
        brand: "",
        stock_quantity: 0,
        barcode: "",
        specifications: [],
        reviews_data: [],
        questions: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "specifications"
  });

  useEffect(() => {
    if (product) {
      form.reset({
        ...product,
        stock_quantity: product.stock_quantity || 0,
        specifications: product.specifications ? Object.entries(product.specifications).map(([key, value]) => ({ key, value })) : [],
        reviews_data: product.reviews_data || [],
        questions: product.questions || [],
      });
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        image: 'https://picsum.photos/seed/product/600/600',
        category: 'Electronics',
        brand: '',
        stock_quantity: 0,
        barcode: '',
        specifications: [],
        reviews_data: [],
        questions: [],
      });
    }
  }, [product, form]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast({ title: 'Uploading image...', description: 'Please wait.' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { publicUrl } = await uploadProductImage(formData);
      form.setValue('image', publicUrl, { shouldValidate: true });
      toast({ title: 'Success!', description: 'Image uploaded and URL updated.' });
    } catch (error) {
      console.error('Image upload error:', error);
      toast({ title: 'Upload Failed', description: 'Could not upload image.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
       if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGenerateDescription = async () => {
    const productName = form.getValues("name");
    if (!productName) {
        toast({ title: "Product name is empty", description: "Please enter a product name first.", variant: "destructive" });
        return;
    }
    setIsGeneratingDesc(true);
    try {
        const result = await generateProductDescription({ productName });
        form.setValue("description", result.description, { shouldValidate: true });
        toast({ title: "Description generated!", description: "The AI-powered description has been added." });
    } catch (e) {
        console.error(e);
        toast({ title: "AI Generation Failed", description: "Could not generate a description.", variant: "destructive"});
    } finally {
        setIsGeneratingDesc(false);
    }
  };


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
    // Convert specifications array back to an object
    const specificationsObject = (values.specifications || []).reduce((acc, spec) => {
      if (spec.key) {
        acc[spec.key] = spec.value;
      }
      return acc;
    }, {} as Record<string, string>);

    const dataToSubmit = {
      ...values,
      specifications: specificationsObject,
      reviews_data: values.reviews_data || [],
      questions: values.questions || [],
    };
    const result = await onSubmit(dataToSubmit as any); // The type will mismatch slightly due to array vs object
    if (result) {
      onCancel();
    }
  };

  return (
    <>
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="details">Product Details</TabsTrigger>
        <TabsTrigger value="specs">Specifications</TabsTrigger>
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
                  <div className="flex items-center justify-between">
                    <FormLabel>Description</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGeneratingDesc}>
                       {isGeneratingDesc ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                       Generate
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea placeholder="High-fidelity wireless headphones..." {...field} rows={5} />
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
                            <SelectItem value="Bakery">Bakery</SelectItem>
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
                name="stock_quantity"
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
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="https://picsum.photos/..." {...field} />
                    </FormControl>
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4" />}
                        Upload
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif, image/webp"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting || isUploading}>
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Save Product'}
                </Button>
            </div>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="specs">
         <div className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto pr-2">
            <h3 className="text-lg font-medium">Product Specifications</h3>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <FormField
                    control={form.control}
                    name={`specifications.${index}.key`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Key</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Color" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`specifications.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                         <FormLabel className={index !== 0 ? "sr-only" : ""}>Value</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Black" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <div className="flex-shrink-0">
                     <Label className={index !== 0 ? "sr-only" : ""}>&nbsp;</Label>
                     <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                   </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ key: "", value: "" })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Specification
            </Button>
         </div>
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
            const { name, description, category, brand } = product;
            // Convert spec array to object for AI
            const specificationsObject = product.specifications ? Object.fromEntries(Object.entries(product.specifications)) : {};

            const result = await getProductQuestionAnswer({
                product: { name, description, category, brand, specifications: specificationsObject },
                question: question.text
            });
            setAnswer(result.answer);
            toast({ title: "Answer Generated", description: "AI-powered answer has been drafted for you."})
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
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Wand2 className="mr-2 h-4 w-4" />}
                            AI Assist
                        </Button>
                    </div>
                 </form>
            )}
        </div>
    )
}
