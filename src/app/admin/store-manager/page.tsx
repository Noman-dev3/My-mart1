
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Barcode, ScanLine, ShoppingCart, Trash2, Loader2, UserPlus, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProductByBarcode, type Product, addProduct } from '@/lib/product-actions';
import { createStoreOrder } from '@/lib/order-actions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { BrowserMultiFormatReader, NotFoundException, ChecksumException, FormatException } from '@zxing/library';
import ProductForm from '../products/product-form';
import { logAdminActivity } from '@/lib/admin-actions';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { ProductFormValues } from '@/lib/schemas';


type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CustomerSession = {
    id: string; // Unique ID for the session/tab
    name: string;
    cart: CartItem[];
};

type TempProduct = {
    id: string; // The barcode
    name: string;
    price: number;
}

// Local storage helpers
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

const getActiveSessions = (): CustomerSession[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('myMart-active-sessions');
    return stored ? JSON.parse(stored) : [];
};

const saveActiveSessions = (sessions: CustomerSession[]) => {
    localStorage.setItem('myMart-active-sessions', JSON.stringify(sessions));
}


export default function StoreManagerPage() {
  const { toast } = useToast();
  const router = useRouter();
  
  const [sessions, setSessions] = useState<CustomerSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [manualBarcode, setManualBarcode] = useState('');
  const [isCompletingSale, setIsCompletingSale] = useState(false);

  // Dialog states
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  
  const [isTempProductDialogOpen, setIsTempProductDialogOpen] = useState(false);
  const [tempProductBarcode, setTempProductBarcode] = useState('');
  const [tempProductName, setTempProductName] = useState('');
  const [tempProductPrice, setTempProductPrice] = useState('');

  const [isAddProductFormOpen, setIsAddProductFormOpen] = useState(false);
  const [newProductToCreate, setNewProductToCreate] = useState<Partial<Product> | undefined>(undefined);
  
  const barcodeBuffer = useRef<string[]>([]);
  const barcodeTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const codeReader = useRef(new BrowserMultiFormatReader());
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  
  // Load sessions from local storage on initial render
  useEffect(() => {
    const savedSessions = getActiveSessions();
    setSessions(savedSessions);
    if (savedSessions.length > 0) {
      setActiveSessionId(savedSessions[0].id);
    }
  }, []);

  // Save sessions to local storage whenever they change
  useEffect(() => {
    saveActiveSessions(sessions);
  }, [sessions]);

  const updateSessionCart = (sessionId: string, newCart: CartItem[]) => {
      setSessions(prevSessions => 
        prevSessions.map(session => 
            session.id === sessionId ? { ...session, cart: newCart } : session
        )
      );
  }
  
  const addProductToCart = useCallback((product: {id: string, name: string, price: number, image?: string}) => {
      if (!activeSessionId) {
        toast({ title: 'No active session', description: 'Please start a customer session first.', variant: 'destructive'});
        return;
      }
      
      const activeSession = sessions.find(s => s.id === activeSessionId);
      if (!activeSession) return;

      const existingItem = activeSession.cart.find(item => item.id === product.id);
      let newCart: CartItem[];

      if (existingItem) {
        newCart = activeSession.cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...activeSession.cart, { id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image || 'https://picsum.photos/seed/placeholder/100' }];
      }
      
      updateSessionCart(activeSessionId, newCart);
      
      setTimeout(() => {
        toast({ title: "Item Added", description: `${product.name} added to cart for ${activeSession.name}.` });
      }, 0);
  }, [activeSessionId, sessions, toast]);
  
  const processBarcode = useCallback(async (barcode: string) => {
    if (!barcode.trim() || !activeSessionId) return;
    
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
    }
  }, [toast, addProductToCart, activeSessionId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isCustomerDialogOpen || isTempProductDialogOpen || isAddProductFormOpen) return;
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

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
        }, 120);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [processBarcode, isCustomerDialogOpen, isTempProductDialogOpen, isAddProductFormOpen]);

    useEffect(() => {
        if (isCameraOn && videoRef.current) {
            codeReader.current.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
                if (result) {
                    processBarcode(result.getText());
                }
                 if (err && !(err instanceof NotFoundException || err instanceof ChecksumException || err instanceof FormatException)) {
                    console.error("Scanning error:", err);
                 }
            });
        } else {
            codeReader.current.reset();
        }
        return () => codeReader.current.reset();
    }, [isCameraOn, processBarcode]);


  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    processBarcode(manualBarcode);
  };

  const removeFromCart = (productId: string) => {
    if (!activeSessionId) return;
    const activeSession = sessions.find(s => s.id === activeSessionId);
    if (!activeSession) return;
    const newCart = activeSession.cart.filter(item => item.id !== productId);
    updateSessionCart(activeSessionId, newCart);
  }

  const handleStartSession = () => {
    if (!newCustomerName.trim()) {
        toast({ title: "Name required", description: "Please enter a customer name.", variant: "destructive" });
        return;
    }
    const newSession: CustomerSession = { id: `CUST-${Date.now()}`, name: newCustomerName, cart: [] };
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);
    setIsCustomerDialogOpen(false);
    setNewCustomerName('');
  }

  const endSession = (sessionId: string) => {
    setSessions(prev => {
        const newSessions = prev.filter(s => s.id !== sessionId);
        if (activeSessionId === sessionId) {
            setActiveSessionId(newSessions.length > 0 ? newSessions[0].id : null);
        }
        return newSessions;
    });
    toast({ title: "Session Ended", description: "Ready for the next customer." });
  }

  const handleCompleteSale = async () => {
    const activeSession = sessions.find(s => s.id === activeSessionId);
    if (!activeSession || activeSession.cart.length === 0) return;

    setIsCompletingSale(true);
    try {
        const cartTotal = activeSession.cart.reduce((total, item) => total + item.price * item.quantity, 0);
        const order = {
            customer: { name: activeSession.name, id: activeSession.id },
            items: activeSession.cart,
            total: cartTotal,
        };
        
        // Save to DB and log activity
        await createStoreOrder({
            customerName: activeSession.name,
            items: activeSession.cart,
            total: cartTotal,
        });
        await logAdminActivity({
            action: 'Completed in-store sale',
            details: `Customer: ${activeSession.name}, Total: PKR ${cartTotal.toFixed(2)}`
        });
        
        // Store bill details for printing and navigate
        localStorage.setItem('myMart-bill-to-print', JSON.stringify(order));
        router.push('/admin/store-manager/print-bill');
        
        // Remove completed session
        endSession(activeSession.id);

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
    const newTempProduct: TempProduct = { id: tempProductBarcode, name: tempProductName, price: price };
    saveTempProduct(newTempProduct);
    addProductToCart(newTempProduct);
    setIsTempProductDialogOpen(false);
  }

  const handleCreateNewProduct = () => {
      setNewProductToCreate({ barcode: tempProductBarcode });
      setIsTempProductDialogOpen(false);
      setIsAddProductFormOpen(true);
  }

  const onProductFormSubmit = async (values: ProductFormValues) => {
    try {
      const newProduct = await addProduct(values);
      toast({ title: "Success", description: "Product added to inventory." });
      addProductToCart(newProduct);
      setIsAddProductFormOpen(false);
      setNewProductToCreate(undefined);
      return true;
    } catch (error) {
      toast({ title: "Error", description: "Failed to save product.", variant: "destructive" });
      return false;
    }
  }

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const cartTotal = activeSession?.cart.reduce((total, item) => total + item.price * item.quantity, 0) || 0;

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
                     <Button onClick={() => setIsCameraOn(prev => !prev)} variant={isCameraOn ? 'destructive' : 'default'} size="sm">
                       {isCameraOn ? 'Stop Camera' : 'Start Camera'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="w-full max-w-md aspect-video bg-card-foreground/5 rounded-lg overflow-hidden relative">
                    <video ref={videoRef} className={`w-full h-full object-cover ${isCameraOn ? '' : 'hidden'}`} playsInline muted crossOrigin="anonymous"/>
                    {!isCameraOn && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                           <ScanLine className="h-16 w-16 text-muted-foreground/30" />
                           <p className="mt-2 text-muted-foreground">Camera is off. Click "Start Camera".</p>
                        </div>
                    )}
                </div>
                <Separator />
                <form onSubmit={handleManualAdd} className="w-full max-w-md space-y-2">
                    <p className="text-center text-sm text-muted-foreground">Or use a hardware scanner / enter manually</p>
                    <div className="flex gap-2">
                        <Input placeholder="Enter barcode..." value={manualBarcode} onChange={(e) => setManualBarcode(e.target.value)} />
                        <Button type="submit">Add</Button>
                    </div>
                </form>
            </CardContent>
        </Card>

        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShoppingCart/> Billing</CardTitle>
                <div className="flex items-start gap-2 border-b pb-2 -mx-6 px-6">
                    <div className="flex-1 flex items-center gap-1 overflow-x-auto">
                        {sessions.map(session => (
                            <Button key={session.id} variant={activeSessionId === session.id ? 'secondary' : 'ghost'} size="sm" className="shrink-0 pr-2" onClick={() => setActiveSessionId(session.id)}>
                                {session.name}
                                <X className="h-4 w-4 ml-2" onClick={(e) => {e.stopPropagation(); endSession(session.id);}} />
                            </Button>
                        ))}
                    </div>
                    <Button size="icon" variant="outline" className="shrink-0" onClick={() => setIsCustomerDialogOpen(true)}><Plus /></Button>
                </div>
                 <CardDescription className="pt-2">
                    {activeSession ? `Serving: ${activeSession.name}` : 'No active customer. Click [+] to start.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                {activeSession && activeSession.cart.length > 0 ? (
                    <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                        {activeSession.cart.map(item => (
                            <div key={item.id} className="flex items-center justify-between gap-4 p-2 bg-muted/50 rounded-md">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.quantity} x PKR {item.price.toFixed(2)}</p>
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
                       {activeSessionId ? (
                         <>
                            <Barcode className="h-16 w-16 text-muted-foreground/30" />
                            <p className="mt-2 text-muted-foreground">Scan a product to begin</p>
                         </>
                       ) : (
                         <>
                            <UserPlus className="h-16 w-16 text-muted-foreground/30" />
                            <p className="mt-2 text-muted-foreground">Click [+] to start a new customer session.</p>
                         </>
                       )}
                    </div>
                )}
            </CardContent>
            <div className="p-6 border-t mt-auto">
                <div className="flex justify-between font-bold text-xl my-4">
                    <span>Total</span>
                    <span>PKR {cartTotal.toFixed(2)}</span>
                </div>
                <Button className="w-full font-bold" size="lg" disabled={!activeSession || activeSession.cart.length === 0 || isCompletingSale} onClick={handleCompleteSale}>
                    {isCompletingSale ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    Complete & Print Bill
                </Button>
            </div>
        </Card>
      </div>

       <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Start New Customer Session</DialogTitle>
                    <DialogDescription>Enter the customer's name to create a new bill tab.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="customer-name">Customer Name</Label>
                        <Input id="customer-name" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} placeholder="e.g., John Doe" />
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
                    <DialogTitle>Product Not Found</DialogTitle>
                    <DialogDescription>Barcode <span className="font-bold text-primary">{tempProductBarcode}</span> was not found in the inventory.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <h3 className="font-semibold">Option 1: Add as Temporary Product</h3>
                        <p className="text-sm text-muted-foreground">Add a name and price to sell it now. This item will not be saved to the main inventory.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="temp-name">Product Name</Label>
                        <Input id="temp-name" value={tempProductName} onChange={(e) => setTempProductName(e.target.value)} placeholder="e.g., Local Soda" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="temp-price">Price (PKR)</Label>
                        <Input id="temp-price" type="number" value={tempProductPrice} onChange={(e) => setTempProductPrice(e.target.value)} placeholder="e.g., 150" />
                    </div>
                    <Button onClick={handleAddTempProduct} className="w-full">Add to Cart as Temporary</Button>
                </div>
                <Separator />
                <div className="space-y-4 pt-2">
                    <h3 className="font-semibold">Option 2: Add to Main Inventory</h3>
                    <p className="text-sm text-muted-foreground">Open the full product form to add this item permanently.</p>
                    <Button onClick={handleCreateNewProduct} variant="secondary" className="w-full">Open "Add Product" Form</Button>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsTempProductDialogOpen(false)}>Cancel</Button>
                </DialogFooter>
            </DialogContent>
       </Dialog>

       <Dialog open={isAddProductFormOpen} onOpenChange={(open) => { if (!open) setNewProductToCreate(undefined); setIsAddProductFormOpen(open); }}>
          <DialogContent className="sm:max-w-md md:max-w-lg">
              <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
              <ProductForm onSubmit={onProductFormSubmit} product={newProductToCreate as Product | undefined} onCancel={() => setIsAddProductFormOpen(false)} />
          </DialogContent>
      </Dialog>
    </div>
  );
}
