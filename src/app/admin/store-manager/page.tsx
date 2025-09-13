
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Barcode, ScanLine, ShoppingCart, Trash2, Loader2, UserPlus, X, CameraOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProductByBarcode, type Product } from '@/lib/product-actions';
import { createStoreOrder } from '@/lib/order-actions';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


type ScannedProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CustomerSession = {
    id: string;
    name: string;
};

type TempProduct = {
    id: string; // The barcode
    name: string;
    price: number;
}

// Local storage helpers for temporary products
const getTempProducts = (): TempProduct[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('myMart-temp-products');
    return stored ? JSON.parse(stored) : [];
};

const saveTempProduct = (product: TempProduct) => {
    const products = getTempProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    if (existingIndex > -1) {
        products[existingIndex] = product;
    } else {
        products.push(product);
    }
    localStorage.setItem('myMart-temp-products', JSON.stringify(products));
};


export default function StoreManagerPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [cart, setCart] = useState<ScannedProduct[]>([]);
  const [manualBarcode, setManualBarcode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompletingSale, setIsCompletingSale] = useState(false);

  // Customer session state
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerSession | null>(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerId, setNewCustomerId] = useState('');
  
  // Temporary product state
  const [isTempProductDialogOpen, setIsTempProductDialogOpen] = useState(false);
  const [tempProductBarcode, setTempProductBarcode] = useState('');
  const [tempProductName, setTempProductName] = useState('');
  const [tempProductPrice, setTempProductPrice] = useState('');
  
  const barcodeBuffer = useRef<string[]>([]);
  const barcodeTimeout = useRef<NodeJS.Timeout | null>(null);

  const codeReader = useRef(new BrowserMultiFormatReader());
  const streamRef = useRef<MediaStream | null>(null);
  
  const addProductToCart = useCallback((product: {id: string, name: string, price: number, image?: string}) => {
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.id);
        if (existingItem) {
          return prevCart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prevCart, { id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image || 'https://picsum.photos/seed/placeholder/100' }];
      });
      setTimeout(() => {
        toast({ title: "Item Added", description: `${product.name} added to cart.` });
      }, 0);
  }, [toast]);

  const processBarcode = useCallback(async (barcode: string) => {
    if (!barcode.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    toast({ title: 'Processing...', description: `Searching for barcode: ${barcode}` });

    try {
        const tempProducts = getTempProducts();
        const tempProduct = tempProducts.find(p => p.id === barcode.trim());

        if (tempProduct) {
            addProductToCart(tempProduct);
            return;
        }

        const { data: product, error } = await getProductByBarcode(barcode.trim());

        if (error || !product) {
            setTempProductBarcode(barcode.trim());
            setTempProductName('');
            setTempProductPrice('');
            setIsTempProductDialogOpen(true);
        } else {
            addProductToCart(product);
        }
    } catch(e) {
        console.error("Error processing barcode:", e);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not process the barcode.',
        });
    } finally {
        setManualBarcode('');
        setTimeout(() => { 
            setIsSubmitting(false);
        }, 1500); 
    }
  }, [toast, isSubmitting, addProductToCart]);
  

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isCustomerDialogOpen || isTempProductDialogOpen) return;

        if (e.key === 'Enter') {
            e.preventDefault(); 
            if (barcodeBuffer.current.length > 0) {
                processBarcode(barcodeBuffer.current.join(''));
                barcodeBuffer.current = [];
            }
            return;
        }

        if (e.key.length > 1) return;

        barcodeBuffer.current.push(e.key);

        if (barcodeTimeout.current) clearTimeout(barcodeTimeout.current);

        barcodeTimeout.current = setTimeout(() => {
            if (barcodeBuffer.current.length > 3) { 
                processBarcode(barcodeBuffer.current.join(''));
            }
            barcodeBuffer.current = [];
        }, 100);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if (barcodeTimeout.current) clearTimeout(barcodeTimeout.current);
    };
  }, [processBarcode, isCustomerDialogOpen, isTempProductDialogOpen]);
  
  const tick = useCallback(() => {
    if (isSubmitting || !isCameraOn) return;

    if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current.getContext('2d');
      if (canvas) {
        canvasRef.current.height = videoRef.current.videoHeight;
        canvasRef.current.width = videoRef.current.videoWidth;
        canvas.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        try {
          const result = codeReader.current.decodeFromCanvas(canvasRef.current);
          if (result) {
            processBarcode(result.getText());
          }
        } catch (err) {
          if (!(err instanceof NotFoundException)) {
            // console.error('Barcode decoding error:', err);
          }
        }
      }
    }
    requestAnimationFrame(tick);
  }, [isSubmitting, isCameraOn, processBarcode]);
  
  useEffect(() => {
    let animationFrameId: number;
    const startScanner = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          animationFrameId = requestAnimationFrame(tick);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setIsCameraOn(false); // Turn off toggle if permission is denied
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description:
            'Please enable camera permissions in your browser settings.',
        });
      }
    };

    const stopScanner = () => {
      cancelAnimationFrame(animationFrameId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    if (isCameraOn) {
      startScanner();
    } else {
      stopScanner();
    }
    
    // Cleanup function
    return () => {
      stopScanner();
    };
  }, [isCameraOn, tick, toast]);


  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    processBarcode(manualBarcode);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }

  const handleNewCustomerClick = () => {
    setNewCustomerId(`CUST-${Date.now()}`);
    setNewCustomerName('');
    setIsCustomerDialogOpen(true);
  }

  const handleStartSession = () => {
    if (!newCustomerName.trim()) {
        toast({ title: "Name required", description: "Please enter a customer name.", variant: "destructive" });
        return;
    }
    setCurrentCustomer({ id: newCustomerId, name: newCustomerName });
    setIsCustomerDialogOpen(false);
    setCart([]);
  }

  const endSession = () => {
    setCurrentCustomer(null);
    setCart([]);
    toast({ title: "Session Ended", description: "Ready for the next customer." });
  }

  const handleCompleteSale = async () => {
    if (!currentCustomer || cart.length === 0) return;

    setIsCompletingSale(true);
    try {
        await createStoreOrder({
            customerName: currentCustomer.name,
            customerId: currentCustomer.id,
            items: cart,
            total: cartTotal,
        });
        toast({ title: "Sale Completed!", description: "Order has been recorded successfully." });
        endSession();
    } catch (error) {
        console.error("Failed to complete sale:", error);
        toast({ title: "Error", description: "Failed to complete the sale. Please try again.", variant: "destructive" });
    } finally {
        setIsCompletingSale(false);
    }
  };

  const handleAddTempProduct = () => {
    const price = parseFloat(tempProductPrice);
    if (!tempProductName.trim() || isNaN(price) || price <= 0) {
        toast({ title: "Invalid Data", description: "Please enter a valid name and price.", variant: "destructive" });
        return;
    }
    
    const newTempProduct: TempProduct = {
        id: tempProductBarcode,
        name: tempProductName,
        price: price,
    };
    
    saveTempProduct(newTempProduct);
    addProductToCart(newTempProduct);
    setIsTempProductDialogOpen(false);
  }

  const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartTotal = cartSubtotal;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold font-headline">Store Manager</h1>
        <p className="text-muted-foreground">Point of Sale (POS) and Inventory Management.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2"><ScanLine /> Scanner</CardTitle>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="camera-toggle">Use Camera</Label>
                        <Switch id="camera-toggle" checked={isCameraOn} onCheckedChange={setIsCameraOn} />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center gap-4">
                 {isCameraOn && (
                    <div className="w-full max-w-md aspect-video bg-card-foreground/5 rounded-lg overflow-hidden relative">
                        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-4/5 h-1/2 border-4 border-dashed border-primary/50 rounded-lg" />
                        </div>
                         {hasCameraPermission === false && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10 text-center">
                                <CameraOff className="h-10 w-10 text-destructive" />
                                <p className="mt-2 text-muted-foreground">Camera access is required.</p>
                                <p className="text-xs text-muted-foreground/80 px-4">Please allow camera permissions in your browser settings and refresh the page.</p>
                            </div>
                        )}
                    </div>
                 )}
                 
                 <Separator />
                <form onSubmit={handleManualAdd} className="w-full max-w-md space-y-2">
                    <p className="text-center text-sm text-muted-foreground">Or use a hardware scanner / enter manually</p>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Enter barcode..." 
                            value={manualBarcode} 
                            onChange={(e) => setManualBarcode(e.target.value)}
                            disabled={isSubmitting}
                        />
                        <Button type="submit" disabled={isSubmitting}>
                           {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>

        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2"><ShoppingCart/> Billing</CardTitle>
                    {currentCustomer ? (
                        <Button variant="destructive" size="sm" onClick={endSession}><X className="mr-2 h-4 w-4"/> End Session</Button>
                    ) : (
                        <Button onClick={handleNewCustomerClick}><UserPlus className="mr-2 h-4 w-4"/> New Customer</Button>
                    )}
                </div>
                {currentCustomer ? (
                    <CardDescription>
                        Serving: <span className="font-bold text-primary">{currentCustomer.name}</span> (ID: {currentCustomer.id})
                    </CardDescription>
                ) : (
                    <CardDescription>Start a new session to begin billing.</CardDescription>
                )}
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
                       {currentCustomer ? (
                         <>
                            <Barcode className="h-16 w-16 text-muted-foreground/30" />
                            <p className="mt-2 text-muted-foreground">Scan a product to begin</p>
                         </>
                       ) : (
                         <>
                            <UserPlus className="h-16 w-16 text-muted-foreground/30" />
                            <p className="mt-2 text-muted-foreground">Click "New Customer" to start a sale.</p>
                         </>
                       )}
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
                <Button 
                    className="w-full font-bold" 
                    size="lg" 
                    disabled={cart.length === 0 || !currentCustomer || isCompletingSale}
                    onClick={handleCompleteSale}
                >
                    {isCompletingSale ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    Complete Sale
                </Button>
            </div>
        </Card>
      </div>

       <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Start New Customer Session</DialogTitle>
                    <DialogDescription>
                        Enter the customer's name to begin a new transaction.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="customer-name">Customer Name</Label>
                        <Input 
                            id="customer-name" 
                            value={newCustomerName}
                            onChange={(e) => setNewCustomerName(e.target.value)}
                            placeholder="e.g., John Doe"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="session-id">Session ID</Label>
                        <Input id="session-id" value={newCustomerId} disabled />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleStartSession}>Start Session</Button>
                </DialogFooter>
            </DialogContent>
       </Dialog>
       
       <Dialog open={isTempProductDialogOpen} onOpenChange={setIsTempProductDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Temporary Product</DialogTitle>
                    <DialogDescription>
                        This barcode was not found. Add a temporary name and price to sell it now.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="temp-barcode">Barcode</Label>
                        <Input id="temp-barcode" value={tempProductBarcode} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="temp-name">Product Name</Label>
                        <Input 
                            id="temp-name" 
                            value={tempProductName}
                            onChange={(e) => setTempProductName(e.target.value)}
                            placeholder="e.g., Local Soda"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="temp-price">Price (PKR)</Label>
                        <Input 
                            id="temp-price" 
                            type="number"
                            value={tempProductPrice}
                            onChange={(e) => setTempProductPrice(e.target.value)}
                            placeholder="e.g., 150"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsTempProductDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddTempProduct}>Add to Cart</Button>
                </DialogFooter>
            </DialogContent>
       </Dialog>
    </div>
  );

    