
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import InvoiceTemplate from '@/components/invoice-template';
import type { Order } from '@/lib/order-actions';
import '@/app/admin/orders/invoice.css'; // Re-use the same print styles

type BillData = Omit<Order, 'id' | 'status' | 'paymentMethod'> & {
    customer: { name: string; id: string };
    date: string;
};

export default function PrintBillPage() {
    const [bill, setBill] = useState<BillData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const billDataString = localStorage.getItem('myMart-bill-to-print');
        if (billDataString) {
            try {
                const parsedData = JSON.parse(billDataString);
                // Create a synthetic order object for the InvoiceTemplate
                 const syntheticOrder: Order = {
                    id: parsedData.customer.id,
                    customer: { 
                        name: parsedData.customer.name, 
                        email: '', 
                        phone: '', 
                        address: 'In-Store'
                    },
                    items: parsedData.items,
                    total: parsedData.total,
                    status: 'Delivered',
                    paymentMethod: 'In-Store',
                    date: new Date().toISOString()
                };
                setBill(syntheticOrder);

                // Auto-trigger print
                setTimeout(() => {
                    window.print();
                }, 500); // Small delay to ensure render

            } catch (error) {
                console.error("Failed to parse bill data from local storage", error);
            }
        }
        setLoading(false);
    }, []);

    if (loading) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!bill) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4 text-center">
                <h1 className="text-2xl font-bold">No Bill Data Found</h1>
                <p className="text-muted-foreground">There is no bill information to print. Please complete a sale first.</p>
                <Button onClick={() => router.push('/admin/store-manager')}>
                    <ArrowLeft className="mr-2" />
                    Back to Store Manager
                </Button>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8">
            <div className="max-w-md mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-md print:hidden">
                 <h1 className="text-2xl font-bold text-center font-headline">Print Preview</h1>
                 <p className="text-center text-muted-foreground mb-4">Your print dialog should open automatically.</p>
                 <div className="flex gap-4">
                    <Button variant="outline" className="w-full" onClick={() => router.push('/admin/store-manager')}>
                        <ArrowLeft className="mr-2"/>
                        Back to Manager
                    </Button>
                    <Button className="w-full" onClick={() => window.print()}>
                        <Printer className="mr-2"/>
                        Print Again
                    </Button>
                </div>
            </div>
            
            {/* This is the printable component */}
            <div className="invoice-container mx-auto mt-4 sm:mt-8">
                <InvoiceTemplate order={bill as Order} />
            </div>
        </div>
    );
}
