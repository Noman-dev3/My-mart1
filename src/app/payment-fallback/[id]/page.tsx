
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrderById, type Order } from '@/lib/order-actions';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Copy, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function PaymentFallbackPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
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
        <Header />
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
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-16">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center items-center gap-2 pt-8">
            <AlertTriangle className="h-16 w-16 text-yellow-500" />
            <CardTitle className="text-3xl font-headline">Manual Order Confirmation</CardTitle>
            <CardDescription>Your order is pending. Please confirm it manually.</CardDescription>
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
            
            <div className="text-center p-4 border border-dashed rounded-lg">
                <h3 className="font-headline font-semibold text-lg">Next Steps: Confirm Your Order</h3>
                <p className="text-muted-foreground mt-2">
                    To complete your purchase, please contact us with your Order ID to arrange payment.
                </p>
                <div className="mt-4 text-lg">
                    <p>Call or WhatsApp us at:</p>
                    <p className="font-bold text-primary text-xl">+92 311 9991972</p>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Your order will be processed once payment is confirmed.</p>
            </div>

            <div>
                <h3 className="font-headline font-semibold text-lg mb-2">Order Summary</h3>
                 <div className="space-y-3 max-h-60 overflow-y-auto pr-2 border-t border-b py-3">
                    {order.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Image src={item.image} alt={item.name} width={48} height={48} className="rounded-md" />
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                            </div>
                            <p className="font-medium">PKR {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
                 <div className="flex justify-between text-lg font-bold pt-3">
                    <p>Total</p>
                    <p>PKR {order.total.toFixed(2)}</p>
                </div>
            </div>

          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <Button onClick={() => router.push('/products')}>Continue Shopping</Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
