
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Barcode, ScanLine, ShoppingCart, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Placeholder for a scanned product type
type ScannedProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export default function StoreManagerPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [cart, setCart] = useState<ScannedProduct[]>([]);
  const [manualBarcode, setManualBarcode] = useState('');
  
  // Request camera permission on component mount
  useEffect(() => {
    async function getCameraPermission() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        toast({
            variant: 'destructive',
            title: 'Camera Not Supported',
            description: 'Your browser does not support camera access.',
        });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    }
    getCameraPermission();
  }, [toast]);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if(!manualBarcode.trim()) return;

    // TODO: In the next step, we will look up the product by barcode.
    // For now, we add a mock product.
    console.log(`Manually adding barcode: ${manualBarcode}`);
    const mockProduct: ScannedProduct = {
        id: manualBarcode,
        name: `Product ${manualBarcode.slice(0,5)}`,
        price: Math.floor(Math.random() * 1000) + 100,
        quantity: 1
    }
    setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === mockProduct.id);
        if (existingItem) {
            return prevCart.map(item => item.id === mockProduct.id ? {...item, quantity: item.quantity + 1} : item);
        }
        return [...prevCart, mockProduct];
    });

    setManualBarcode('');
    toast({ title: "Item Added", description: `${mockProduct.name} added to cart.`});
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }

  const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartTotal = cartSubtotal; // Placeholder for taxes/discounts

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold font-headline">Store Manager</h1>
        <p className="text-muted-foreground">Point of Sale (POS) and Inventory Management.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Left Column: Scanner and Manual Input */}
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ScanLine /> Scanner</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="w-full max-w-md aspect-video bg-card-foreground/5 rounded-lg overflow-hidden relative">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-4/5 h-1/2 border-4 border-dashed border-primary/50 rounded-lg" />
                    </div>
                </div>
                 {hasCameraPermission === false && (
                    <Alert variant="destructive">
                      <AlertTitle>Camera Access Required</AlertTitle>
                      <AlertDescription>
                        Please allow camera access in your browser settings to use the scanner.
                      </AlertDescription>
                    </Alert>
                )}
                 <Separator />
                <form onSubmit={handleManualAdd} className="w-full max-w-md space-y-2">
                    <p className="text-center text-sm text-muted-foreground">Or enter barcode manually</p>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Enter barcode..." 
                            value={manualBarcode} 
                            onChange={(e) => setManualBarcode(e.target.value)}
                        />
                        <Button type="submit">Add</Button>
                    </div>
                </form>
            </CardContent>
        </Card>

        {/* Right Column: Billing */}
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShoppingCart/> Billing</CardTitle>
                <CardDescription>Items will appear here once scanned.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                {cart.length > 0 ? (
                    <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center justify-between gap-4 p-2 bg-muted/50 rounded-md">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.quantity} x PKR {item.price.toFixed(2)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold">PKR {(item.price * item.quantity).toFixed(2)}</p>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeFromCart(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center border-dashed border-2 rounded-lg">
                        <Barcode className="h-16 w-16 text-muted-foreground/30" />
                        <p className="mt-2 text-muted-foreground">Scan a product to begin</p>
                    </div>
                )}
            </CardContent>
            <div className="p-6 border-t mt-auto">
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>PKR {cartSubtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between text-muted-foreground text-sm">
                        <span>Taxes</span>
                        <span>PKR 0.00</span>
                    </div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-xl my-4">
                    <span>Total</span>
                    <span>PKR {cartTotal.toFixed(2)}</span>
                </div>
                <Button className="w-full font-bold" size="lg" disabled={cart.length === 0}>
                    Complete Sale
                </Button>
            </div>
        </Card>
      </div>
    </div>
  );
}

