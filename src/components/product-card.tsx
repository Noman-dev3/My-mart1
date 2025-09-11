
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { type Product } from '@/lib/product-actions';
import ProductRating from '@/components/product-rating';
import { cn } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';
import { useContext } from 'react';
import { CartContext } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useContext(CartContext);
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };
  
  const inStock = product.stockQuantity > 0;

  return (
    <Card className="flex flex-col overflow-hidden h-full rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0 border-b relative">
        <Link href={`/product/${product.id}`} className="block">
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={600}
            className="object-cover aspect-square w-full h-full"
            data-ai-hint="product image"
          />
        </Link>
        {!inStock && (
          <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
            Out of Stock
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <p className="text-sm text-muted-foreground">{product.category}</p>
        <h3 className="text-lg font-headline font-semibold mt-1 leading-tight">
          <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>
        <div className="mt-2">
          <ProductRating rating={product.rating} totalReviews={product.reviews} />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-xl font-bold font-headline text-primary">
          PKR {product.price.toFixed(2)}
        </p>
        <Button size="icon" variant="outline" disabled={!inStock} aria-label="Add to cart" onClick={handleAddToCart}>
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
