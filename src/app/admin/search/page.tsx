
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { type Product } from '@/lib/product-actions';
import { type Order } from '@/lib/order-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, Search, Package, ShoppingCart, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Customer = {
    email: string;
    name: string;
    totalOrders: number;
    totalSpent: number;
    lastOrder: Date;
}

function SearchResultsPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const supabase = createSupabaseBrowserClient();

    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    useEffect(() => {
        if (!query) {
            setIsLoading(false);
            return;
        }

        const performSearch = async () => {
            setIsLoading(true);

            // Using Supabase textSearch, which requires a specific format for the query string.
            const formattedQuery = query.trim().split(' ').join(' | ');

            // Fetch products
            const { data: productsData } = await supabase
                .from('products')
                .select('*')
                .textSearch('name', formattedQuery, { type: 'plain', config: 'english' });

            // Fetch orders
            const { data: ordersData } = await supabase
                .from('orders')
                .select('*')
                .or(`id.ilike.%${query}%,customer->>name.ilike.%${query}%,customer->>email.ilike.%${query}%`);
            
            // Fetch customers (aggregated from orders)
            const { data: allOrders } = await supabase.from('orders').select('*');
             const customerData = (allOrders || []).reduce((acc, order) => {
                const email = order.customer.email;
                if (!acc[email]) {
                    acc[email] = {
                        email,
                        name: order.customer.name,
                        totalOrders: 0,
                        totalSpent: 0,
                        lastOrder: new Date(order.date),
                    };
                }
                acc[email].totalOrders += 1;
                acc[email].totalSpent += order.total;
                if (new Date(order.date) > acc[email].lastOrder) {
                    acc[email].lastOrder = new Date(order.date);
                }
                return acc;
            }, {} as Record<string, Customer>);

            const lowerCaseQuery = query.toLowerCase();
            const filteredCustomers = Object.values(customerData).filter(c => 
                c.name.toLowerCase().includes(lowerCaseQuery) || 
                c.email.toLowerCase().includes(lowerCaseQuery)
            );

            setProducts(productsData || []);
            setOrders(ordersData || []);
            setCustomers(filteredCustomers || []);
            setIsLoading(false);
        };

        performSearch();
    }, [query, supabase]);
    
    const totalResults = products.length + orders.length + customers.length;

    return (
        <div className="bg-muted/30 min-h-screen">
            <header className="bg-card border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <h1 className="text-xl font-semibold">
                        Search results for &quot;<span className="text-primary">{query}</span>&quot;
                    </h1>
                </div>
            </header>
            <main className="container mx-auto px-4 lg:px-8 py-8">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : totalResults === 0 ? (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-semibold">No Results Found</h2>
                        <p className="text-muted-foreground mt-2">Try a different search term.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {products.length > 0 && (
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Package/> Products ({products.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                       {products.slice(0, 5).map(p => (
                                           <div key={p.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                               <div className="font-medium">{p.name}</div>
                                               <Button variant="outline" size="sm" asChild><Link href={`/admin/products`}>View</Link></Button>
                                           </div>
                                       ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                         {orders.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><ShoppingCart/> Orders ({orders.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Order ID</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                        {orders.slice(0, 5).map(o => (
                                            <TableRow key={o.id}>
                                                <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}...</TableCell>
                                                <TableCell>{o.customer.name}</TableCell>
                                                <TableCell><Badge variant="secondary">{o.status}</Badge></TableCell>
                                                <TableCell className="text-right">PKR {o.total.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                         )}
                         {customers.length > 0 && (
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Users/> Customers ({customers.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                     <Table>
                                         <TableHeader>
                                            <TableRow>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Total Orders</TableHead>
                                                <TableHead className="text-right">Total Spent</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {customers.slice(0, 5).map(c => (
                                                <TableRow key={c.email}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar><AvatarFallback>{c.name.charAt(0)}</AvatarFallback></Avatar>
                                                            <div>
                                                                <div className="font-medium">{c.name}</div>
                                                                <div className="text-xs text-muted-foreground">{c.email}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{c.totalOrders}</TableCell>
                                                    <TableCell className="text-right">PKR {c.totalSpent.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                             </Card>
                         )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <SearchResultsPage />
        </Suspense>
    );
}

    