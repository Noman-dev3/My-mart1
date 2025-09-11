
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrderById, type Order, updateOrderStatus } from '@/lib/order-actions';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof id === 'string') {
      getOrderById(id)
        .then((orderData) => {
          if (orderData) {
            setOrder(orderData);
          } else {
            toast({ title: 'Error', description: 'Order not found.', variant: 'destructive' });
          }
          setLoading(false);
        })
        .catch(() => {
          toast({ title: 'Error', description: 'Failed to fetch order details.', variant: 'destructive' });
          setLoading(false);
        });
    }
  }, [id, toast]);

  const copyToClipboard = () => {
    if (order) {
      navigator.clipboard.writeText(order.id);
      toast({ title: 'Copied!', description: 'Order ID copied to clipboard.' });
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setIsSubmitting(true);
    try {
      // In a real app, you'd verify the transaction ID with Foree Pay's API.
      // Here, we'll just simulate success and update the order status.
      await updateOrderStatus(order.id, 'Processing');
      toast({
        title: 'Payment Confirmed!',
        description: 'Your order is now being processed.',
      });
      router.push(`/`); // Redirect to home after successful "payment"
    } catch (error) {
      toast({
        title: 'Payment Confirmation Failed',
        description: 'Could not update order status. Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header searchQuery="" setSearchQuery={() => {}} />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header searchQuery="" setSearchQuery={() => {}} />
        <main className="flex-grow flex items-center justify-center text-center p-4">
            <div>
                <h1 className="text-2xl font-headline font-bold">Order Not Found</h1>
                <p className="text-muted-foreground mt-2">We couldn't find the order you're looking for.</p>
                <Button onClick={() => router.push('/')} className="mt-4">
                    Return to Homepage
                </Button>
            </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header searchQuery="" setSearchQuery={() => {}} />
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center items-center gap-2 pt-8">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <CardTitle className="text-3xl font-headline">Order Placed Successfully!</CardTitle>
            <CardDescription>Your order has been submitted. Please complete the payment below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg text-center space-y-2">
                <p className="text-sm text-muted-foreground">Your Order ID is:</p>
                <div className="flex items-center justify-center gap-2">
                    <p className="text-lg font-bold font-mono tracking-wider">{order.id}</p>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            
            <div className="p-6 border border-dashed rounded-lg">
                <h3 className="font-headline font-semibold text-xl text-center">Complete with Foree Pay</h3>
                <div className="text-center text-muted-foreground mt-2 text-sm">
                    <p>1. Open your Foree Pay app.</p>
                    <p>2. Send <span className="font-bold text-foreground">PKR {order.total.toFixed(2)}</span> to the merchant account: <span className="font-bold text-primary">mymart-store</span></p>
                    <p>3. Enter the transaction ID below to confirm your order.</p>
                </div>

                <form onSubmit={handlePaymentSubmit} className="mt-6 space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="transactionId">Foree Pay Transaction ID</Label>
                        <Input type="text" id="transactionId" placeholder="e.g., FP12345678" required />
                    </div>
                    <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Confirm Payment
                    </Button>
                </form>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col justify-center pb-8 gap-2">
             <p className="text-xs text-muted-foreground">Having trouble? <a href={`/payment-fallback/${order.id}`} className="text-primary hover:underline">Use manual confirmation</a>.</p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
