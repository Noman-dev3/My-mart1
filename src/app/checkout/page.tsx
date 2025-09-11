
'use client';

import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CartContext } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { placeOrder } from '@/lib/order-actions';

const checkoutSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  address: z.string().min(10, { message: 'Please enter a full address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      phone: '',
    },
  });

  async function onSubmit(data: CheckoutFormValues) {
    if (cartItems.length === 0) {
      toast({
        title: 'Your cart is empty',
        description: 'Add items to your cart before checking out.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newOrder = await placeOrder({
        customer: data,
        items: cartItems,
        total: cartTotal,
      });

      toast({
        title: 'Order Submitted!',
        description: 'Your order has been received. Please follow the instructions to confirm.',
      });
      clearCart();
      router.push(`/order-confirmation/${newOrder.id}`);
    } catch (error) {
      toast({
        title: 'Order Failed',
        description: 'There was a problem submitting your order. Please try again.',
        variant: 'destructive',
      });
    }
  }

  if (cartItems.length === 0 && form.formState.isSubmitted === false) {
     return (
        <div className="flex flex-col min-h-screen">
         <Header searchQuery="" setSearchQuery={() => {}} />
            <main className="flex-grow container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-headline font-bold">Your cart is empty</h1>
                <p className="text-muted-foreground mt-2">You can't proceed to checkout without any items.</p>
                <Button onClick={() => router.push('/products')} className="mt-4">
                    Continue Shopping
                </Button>
            </main>
         <Footer />
        </div>
     )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header searchQuery="" setSearchQuery={() => {}} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-headline font-bold text-center mb-10">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-headline font-semibold mb-6">Shipping Information</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, Anytown, USA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full font-bold" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Submitting Order...' : `Submit Order - $${cartTotal.toFixed(2)}`}
                </Button>
              </form>
            </Form>
          </div>
          <div className="bg-muted/30 p-8 rounded-lg">
            <h2 className="text-2xl font-headline font-semibold mb-6">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md" />
                        <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <Separator className="my-6" />
            <div className="space-y-2">
                <div className="flex justify-between">
                    <p className="text-muted-foreground">Subtotal</p>
                    <p className="font-medium">${cartTotal.toFixed(2)}</p>
                </div>
                 <div className="flex justify-between">
                    <p className="text-muted-foreground">Shipping</p>
                    <p className="font-medium">Free</p>
                </div>
                <Separator className="my-2" />
                 <div className="flex justify-between text-lg font-bold">
                    <p>Total</p>
                    <p>${cartTotal.toFixed(2)}</p>
                </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
