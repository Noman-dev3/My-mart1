
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Package, Users, Download, Activity, ShoppingCart } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Area, AreaChart, Pie, PieChart, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { type Order as OrderType } from '@/lib/order-actions';
import Link from 'next/link';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';


const salesData = [
  { date: '2023-01', sales: 4000 }, { date: '2023-02', sales: 3000 },
  { date: '2023-03', sales: 5000 }, { date: '2023-04', sales: 4500 },
  { date: '2023-05', sales: 6000 }, { date: '2023-06', sales: 7500 },
];

const topProductsData = [
    { name: 'Headphones', sales: 450 },
    { name: 'T-Shirt', sales: 380 },
    { name: 'Smart TV', sales: 320 },
    { name: 'Coffee Beans', sales: 280 },
    { name: 'Running Shoes', sales: 240 },
];

const categoryData = [
    { name: 'Electronics', value: 45, color: 'hsl(var(--chart-1))' },
    { name: 'Fashion', value: 25, color: 'hsl(var(--chart-2))'},
    { name: 'Groceries', value: 20, color: 'hsl(var(--chart-3))' },
    { name: 'Home Goods', value: 10, color: 'hsl(var(--chart-4))' },
];

const activityLog = [
    { user: 'Admin User', action: 'Updated product "Wireless Headphones"', time: '2h ago' },
    { user: 'Manager Alex', action: 'Changed order ORD002 status to "Processing"', time: '3h ago' },
    { user: 'Admin User', action: 'Added new product "Leather Wallet"', time: '5h ago' },
];

export default function AdminDashboard() {
  const [recentOrders, setRecentOrders] = useState<OrderType[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy("date", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date?.toDate().toISOString() || new Date().toISOString(),
            } as OrderType;
        });
        setRecentOrders(orders);
    }, (error) => {
        console.error("Failed to listen to recent orders:", error);
    });
    return () => unsubscribe();
  }, [])


  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
            <p className="text-muted-foreground">An overview of your store's performance.</p>
        </div>
        <Button>
            <Download className="mr-2 h-4 w-4" />
            Download Report
        </Button>
       </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+25</div>
            <p className="text-xs text-muted-foreground">+10% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+120</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>
        <Card className='border-destructive/50'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">5</div>
            <p className="text-xs text-muted-foreground">Products running low</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[250px] w-full">
            <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis stroke="" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${'${value / 1000}'}k`} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
                <BarChart data={topProductsData} layout="vertical" margin={{ left: 20, right: 30 }}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} stroke="" width={100} />
                    <ChartTooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="h-[300px] w-full">
                <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                         {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>You have {recentOrders.length} recent orders.</CardDescription>
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
                    {recentOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/50">
                          <Link href="/admin/orders" className="contents">
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{order.customer.name}</TableCell>
                            <TableCell>
                                <Badge 
                                variant={
                                    order.status === 'Delivered' ? 'default' : 
                                    order.status === 'Processing' ? 'secondary' : 
                                    'outline'
                                }
                                >{order.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                          </Link>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {activityLog.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                    <div className="bg-muted rounded-full p-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm" dangerouslySetInnerHTML={{ __html: activity.action.replace(/"(.*?)"/g, '<span class="font-semibold text-foreground">"$1"</span>') }} />
                        <p className="text-xs text-muted-foreground">{activity.user} &middot; {activity.time}</p>
                    </div>
                </div>
             ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
