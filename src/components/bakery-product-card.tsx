
'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { type Product } from '@/lib/product-actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState, useContext } from 'react';
import { Send, User, Loader2 } from 'lucide-react';
import type { CartItem } from '@/context/cart-context';
import { placeBakeryOrder } from '@/lib/order-actions';
import { AuthContext } from '@/context/auth-context';
import Link from 'next/link';

type BakeryProductCardProps = {
  product: Product;
};

export default function BakeryProductCard({ product }: BakeryProductCardProps) {
  const { toast } = useToast();
  const { user, loading: userLoading } = useContext(AuthContext);
  const [customization, setCustomization] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitOrder = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'You must be logged in to place a custom order.',
        variant: 'destructive',
      });
      return;
    }
    if (!customization.trim()) {
      toast({
        title: 'Customization is empty',
        description: 'Please describe what you would like on your bakery item.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
        await placeBakeryOrder({
            product,
            customization,
            user,
        });

        toast({
            title: 'Custom Order Submitted!',
            description: `Your request for a custom "${product.name}" has been sent. We will contact you shortly to confirm details and payment.`
        });
        setCustomization('');
    } catch (error) {
        console.error("Bakery order error:", error);
        toast({
            title: 'Submission Failed',
            description: 'There was a problem submitting your custom order. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="flex flex-col overflow-hidden h-full rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0 border-b relative">
        <Image
          src={product.image}
          alt={product.name}
          width={600}
          height={600}
          className="object-cover aspect-square w-full h-full"
          data-ai-hint="bakery item"
        />
      </CardHeader>
      <div className="flex flex-col flex-grow">
        <CardContent className="p-4 flex-grow">
          <h3 className="text-lg font-headline font-semibold mt-1 leading-tight">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">{product.description}</p>
          <div className="mt-4">
            <Label htmlFor={`custom-${product.id}`} className="font-semibold">
              Customization Details
            </Label>
            <Textarea
              id={`custom-${product.id}`}
              className="mt-2"
              placeholder="e.g., 1 pound, chocolate, write 'Happy Birthday'"
              value={customization}
              onChange={(e) => setCustomization(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-col items-stretch gap-2">
            <div className="text-center text-sm text-muted-foreground mb-2">
                Base Price: <span className="font-bold text-primary">PKR {product.price.toFixed(2)}</span>
            </div>
            {userLoading ? <Button disabled className="w-full"><Loader2 className="animate-spin" /></Button> : 
             user ? (
                 <Button type="button" className="w-full font-bold" onClick={handleSubmitOrder} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                    Submit Custom Order
                </Button>
            ) : (
                <Button asChild className="w-full font-bold">
                    <Link href="/login">
                        <User className="mr-2 h-4 w-4" />
                        Login to Order
                    </Link>
                </Button>
            )}
        </CardFooter>
      </div>
    </Card>
  );
}
