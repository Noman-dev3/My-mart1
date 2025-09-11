
'use client';

import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CartContext } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { placeOrder, type PaymentMethod } from '@/lib/order-actions';
import { CreditCard, Truck } from 'lucide-react';

const checkoutSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  address: z.string().min(10, { message: 'Please enter a full address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  paymentMethod: z.enum(['COD', 'Online'], { required_error: 'Please select a payment method.' }),
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
      paymentMethod: 'COD',
    },
  });

  const paymentMethod = form.watch('paymentMethod');

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
      const orderItems = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      const newOrder = await placeOrder({
        customer: data,
        items: orderItems,
        total: cartTotal,
        paymentMethod: data.paymentMethod as PaymentMethod,
      });

      toast({
        title: 'Order Placed!',
        description: data.paymentMethod === 'COD' ? 'Your order will be delivered soon.' : 'Please complete payment to confirm your order.',
      });
      
      clearCart();
      
      if (data.paymentMethod === 'COD') {
        router.push(`/order-confirmation/cod/${newOrder.id}`);
      } else {
        router.push(`/order-confirmation/${newOrder.id}`);
      }

    } catch (error) {
        console.error("Checkout error:", error);
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
             <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <h2 className="text-2xl font-headline font-semibold">Shipping Information</h2>
                <div className="space-y-4">
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
                          <Input placeholder="03001234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />
                
                <h2 className="text-2xl font-headline font-semibold">Payment Method</h2>
                 <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                                <div className="flex items-center w-full p-4 rounded-lg border has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                    <RadioGroupItem value="COD" id="cod" className="translate-y-[1px]"/>
                                    <Label htmlFor="cod" className="flex items-center gap-3 font-normal cursor-pointer text-sm flex-1 ml-3">
                                        <Truck className="h-6 w-6 text-muted-foreground"/>
                                        <div>
                                            <p className="font-semibold">Cash on Delivery (COD)</p>
                                            <p className="text-muted-foreground text-xs">Pay with cash upon delivery.</p>
                                        </div>
                                    </Label>
                                </div>
                            </FormControl>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                             <FormControl>
                                <div className="flex items-center w-full p-4 rounded-lg border has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                    <RadioGroupItem value="Online" id="online" className="translate-y-[1px]"/>
                                    <Label htmlFor="online" className="flex items-center gap-3 font-normal cursor-pointer text-sm flex-1 ml-3">
                                        <CreditCard className="h-6 w-6 text-muted-foreground"/>
                                        <div>
                                            <p className="font-semibold">Online Payment (Foree Pay)</p>
                                            <p className="text-muted-foreground text-xs">Pay securely with Foree Pay.</p>
                                        </div>
                                    </Label>
                                </div>
                            </FormControl>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="w-full font-bold" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Placing Order...' : 
                   paymentMethod === 'COD' ? 'Place Order' : `Proceed to Payment - PKR ${cartTotal.toFixed(2)}`}
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
                    <p className="font-medium">PKR {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <Separator className="my-6" />
            <div className="space-y-2">
                <div className="flex justify-between">
                    <p className="text-muted-foreground">Subtotal</p>
                    <p className="font-medium">PKR {cartTotal.toFixed(2)}</p>
                </div>
                 <div className="flex justify-between">
                    <p className="text-muted-foreground">Shipping</p>
                    <p className="font-medium">Free</p>
                </div>
                <Separator className="my-2" />
                 <div className="flex justify-between text-lg font-bold">
                    <p>Total</p>
                    <p>PKR {cartTotal.toFixed(2)}</p>
                </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
