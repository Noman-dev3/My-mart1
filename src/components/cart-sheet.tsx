
'use client';

import { useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { CartContext, type CartItem } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export function CartSheet() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useContext(CartContext);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative">
          <ShoppingCart className="h-6 w-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">Shopping Cart</SheetTitle>
        </SheetHeader>
        <Separator />
        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="flex-grow pr-4 -mr-6">
              <div className="flex flex-col gap-6 py-4">
                {cartItems.map((item) => (
                  <CartItemRow key={item.id} item={item} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="mt-auto pt-4 border-t">
              <div className="w-full space-y-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <SheetClose asChild>
                  <Button asChild size="lg" className="w-full font-bold">
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                   <Button variant="outline" className="w-full">Continue Shopping</Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <ShoppingCart className="h-20 w-20 text-muted-foreground/30 mb-4" />
            <h3 className="font-headline text-xl font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground mt-2">Add some products to get started.</p>
            <SheetClose asChild>
              <Button asChild className="mt-6">
                <Link href="/products">Browse Products</Link>
              </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

type CartItemRowProps = {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="relative h-24 w-24 overflow-hidden rounded-md">
        <Image src={item.image} alt={item.name} fill className="object-cover" />
      </div>
      <div className="flex-grow">
        <h4 className="font-semibold text-base leading-tight">
            <Link href={`/product/${item.id}`} className="hover:text-primary transition-colors">{item.name}</Link>
        </h4>
        <p className="text-sm text-muted-foreground mt-1">${item.price.toFixed(2)}</p>
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end h-full">
        <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8" onClick={() => onRemove(item.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
        <p className="font-bold mt-auto">${(item.price * item.quantity).toFixed(2)}</p>
      </div>
    </div>
  );
}
