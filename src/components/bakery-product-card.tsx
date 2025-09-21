
'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { type Product } from '@/lib/product-actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import type { CartItem } from '@/context/cart-context';

type BakeryProductCardProps = {
  product: Product;
  onAddToCart: (item: CartItem) => void;
};

export default function BakeryProductCard({ product, onAddToCart }: BakeryProductCardProps) {
  const { toast } = useToast();
  const [customization, setCustomization] = useState('');

  const handleAddToCart = () => {
    if (!customization.trim()) {
      toast({
        title: 'Customization is empty',
        description: 'Please describe what you would like on your bakery item.',
        variant: 'destructive',
      });
      return;
    }

    const itemWithCustomization = {
      ...product,
      quantity: 1, // Default quantity
      customization: customization,
    };
    
    onAddToCart(itemWithCustomization);

    toast({
        title: 'Added to Cart!',
        description: `Your custom "${product.name}" has been added to your cart.`
    });
    setCustomization('');
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
          <Button type="button" className="w-full font-bold" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-4 w-4"/>
            Add to Cart
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
