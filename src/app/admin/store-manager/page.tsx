
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Barcode, ScanLine, ShoppingCart, Trash2, Loader2, UserPlus, X, CameraOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProductByBarcode, type Product, addProduct } from '@/lib/product-actions';
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
import { BrowserMultiFormatReader, NotFoundException, ChecksumException, FormatException } from '@zxing/library';
import ProductForm from '../products/product-form';
import { logAdminActivity } from '@/lib/admin-actions';


type ScannedProduct = {
  id: string; // Can be product UUID or barcode for temp items
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
  const { toast } = useToast();
  const [cart, setCart] = useState<ScannedProduct[]>([]);
  const [manualBarcode, setManualBarcode] = useState('');
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

  // Add Product Form state
  const [isAddProductFormOpen, setIsAddProductFormOpen] = useState(false);
  const [newProductToCreate, setNewProductToCreate] = useState<Partial<Product> | undefined>(undefined);
  
  const barcodeBuffer = useRef<string[]>([]);
  const barcodeTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const codeReader = useRef(new BrowserMultiFormatReader());
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  
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
    if (!barcode.trim()) return;
    
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
  }, [toast, addProductToCart]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isCustomerDialogOpen || isTempProductDialogOpen || isAddProductFormOpen) return;
        
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return;
        }

        if (e.code === 'Space') {
            e.preventDefault();
            setIsCameraOn(prev => !prev);
            return;
        }

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

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if (barcodeTimeout.current) clearTimeout(barcodeTimeout.current);
    };
  }, [processBarcode, isCustomerDialogOpen, isTempProductDialogOpen, isAddProductFormOpen]);

    useEffect(() => {
        let isMounted = true;
        const debounceTimeout = 300; // ms
        let debounceTimer: NodeJS.Timeout;

        if (isCameraOn) {
            codeReader.current.decodeFromVideoDevice(undefined, videoRef.current!, (result, err) => {
                if (result) {
                    const scannedText = result.getText();
                    if (scannedText && scannedText.trim().length > 0) {
                        // Clear any existing timer to prevent premature shutdown
                        clearTimeout(debounceTimer);
                        
                        // Process the valid barcode
                        processBarcode(scannedText);
                        
                        // Set a new timer to turn off the camera
                        debounceTimer = setTimeout(() => {
                           if(isMounted) setIsCameraOn(false);
                        }, debounceTimeout);
                    }
                }
                 if (err && !(err instanceof NotFoundException || err instanceof ChecksumException || err instanceof FormatException)) {
                    console.error("Scanning error:", err);
                 }
            });
        } else {
            codeReader.current.reset();
        }
        return () => {
            isMounted = false;
            clearTimeout(debounceTimer);
            codeReader.current.reset();
        };
    }, [isCameraOn, processBarcode]);


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
        const order = await createStoreOrder({
            customerName: currentCustomer.name,
            customerId: currentCustomer.id,
            items: cart,
            total: cartTotal,
        });
        await logAdminActivity({
            action: 'Completed in-store sale',
            details: `Order ID: ${order.id.slice(0,8)}, Total: PKR ${order.total.toFixed(2)}`
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

  const handleCreateNewProduct = () => {
      setNewProductToCreate({ barcode: tempProductBarcode });
      setIsTempProductDialogOpen(false);
      setIsAddProductFormOpen(true);
  }

  const onProductFormSubmit = async (values: any) => {
    try {
      const newProduct = await addProduct(values);
      if (newProduct) {
        toast({ title: "Success", description: "Product added to inventory." });
        addProductToCart(newProduct);
        setIsAddProductFormOpen(false);
        setNewProductToCreate(undefined);
        return true;
      }
      return false;
    } catch (error) {
      toast({ title: "Error", description: "Failed to save product.", variant: "destructive" });
      return false;
    }
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
                           <p className="mt-2 text-muted-foreground">Camera is off. Click "Start Camera" or press Spacebar.</p>
                        </div>
                    )}
                </div>
                 
                 <Separator />
                <form onSubmit={handleManualAdd} className="w-full max-w-md space-y-2">
                    <p className="text-center text-sm text-muted-foreground">Or use a hardware scanner / enter manually</p>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Enter barcode..." 
                            value={manualBarcode} 
                            onChange={(e) => setManualBarcode(e.target.value)}
                        />
                        <Button type="submit">
                           Add
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
                    <DialogTitle>Product Not Found</DialogTitle>
                    <DialogDescription>
                        Barcode <span className="font-bold text-primary">{tempProductBarcode}</span> was not found in the inventory.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <div>
                        <h3 className="font-semibold">Option 1: Add as Temporary Product</h3>
                        <p className="text-sm text-muted-foreground">Add a temporary name and price to sell it now. This item will not be saved to the main inventory.</p>
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
                    <Button onClick={handleAddTempProduct} className="w-full">Add to Cart as Temporary</Button>
                </div>
                 <Separator />
                 <div className="space-y-4 pt-2">
                    <h3 className="font-semibold">Option 2: Add to Main Inventory</h3>
                    <p className="text-sm text-muted-foreground">Open the full product form to add this item permanently to your store's inventory.</p>
                    <Button onClick={handleCreateNewProduct} variant="secondary" className="w-full">Open "Add Product" Form</Button>
                 </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsTempProductDialogOpen(false)}>Cancel</Button>
                </DialogFooter>
            </DialogContent>
       </Dialog>

       <Dialog open={isAddProductFormOpen} onOpenChange={(open) => {
          setIsAddProductFormOpen(open);
          if (!open) setNewProductToCreate(undefined);
      }}>
          <DialogContent className="sm:max-w-md md:max-w-lg">
              <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <ProductForm 
                  onSubmit={onProductFormSubmit}
                  product={newProductToCreate as Product | undefined}
                  onCancel={() => {
                      setIsAddProductFormOpen(false);
                      setNewProductToCreate(undefined);
                  }}
              />
          </DialogContent>
      </Dialog>
    </div>
  );

    
