

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Package, Users, Download, Activity, ShoppingCart, AlertTriangle, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { type Order } from '@/lib/order-actions';
import { type Product } from '@/lib/product-actions';
import Link from 'next/link';
import { format, startOfDay, endOfDay, getMonth, getYear, isValid } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type Stats = {
  totalRevenue: number;
  ordersToday: number;
  newCustomers: number;
};

const activityLog = [
    { user: 'Admin User', action: 'Updated product "Wireless Headphones"', time: '2h ago' },
    { user: 'Manager Alex', action: 'Changed order ORD002 status to "Processing"', time: '3h ago' },
    { user: 'Admin User', action: 'Added new product "Leather Wallet"', time: '5h ago' },
];

export default function AdminDashboard() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchAndProcessData = async () => {
        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .order('date', { ascending: false });

        if (ordersError) {
            console.error("Failed to listen to orders:", ordersError);
            setIsLoading(false);
            return;
        }

        const allOrders: Order[] = ordersData ? ordersData.map((o: any) => ({ ...o, date: o.date ? new Date(o.date) : null })) : [];
        
        const today = new Date();
        const startOfToday = startOfDay(today);
        const endOfToday = endOfDay(today);

        const ordersTodayList = allOrders.filter(o => o.date && isValid(o.date) && o.date >= startOfToday && o.date <= endOfToday);
        const uniqueCustomersToday = new Set(ordersTodayList.map(o => o.customer.email)).size;
        
        const totalRevenue = allOrders.length > 0 ? allOrders
            .filter(o => o.status === 'Delivered')
            .reduce((sum, o) => sum + o.total, 0) : 0;

        setRecentOrders(allOrders.slice(0, 5));

        const monthlySales = allOrders.reduce((acc, order) => {
            if (!order || !order.date || !isValid(order.date)) {
                return acc;
            }
            const month = getMonth(order.date);
            const year = getYear(order.date);
            const key = `${year}-${String(month + 1).padStart(2, '0')}`;
            if (!acc[key]) {
                acc[key] = { date: format(new Date(year, month), 'yyyy-MM'), sales: 0 };
            }
            acc[key].sales += order.total;
            return acc;
        }, {} as Record<string, {date: string, sales: number}>);

        const sortedSales = Object.values(monthlySales).sort((a,b) => a.date.localeCompare(b.date));
        setSalesData(sortedSales);
        
        setStats({ totalRevenue, ordersToday: ordersTodayList.length, newCustomers: uniqueCustomersToday });
        setIsLoading(false);
    };

    setIsLoading(true);
    fetchAndProcessData();

    const channel = supabase
      .channel('admin-dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, fetchAndProcessData)
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    }
  }, [supabase]);

  const StatCard = ({ title, value, icon: Icon, description, isLoading }: { title: string, value: string | number, icon: React.ElementType, description: string, isLoading: boolean }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className='text-2xl font-bold'>{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
            <p className="text-muted-foreground">An overview of your store's performance.</p>
        </div>
        <Button className="self-start sm:self-center">
            <Download className="mr-2 h-4 w-4" />
            Download Report
        </Button>
       </div>

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
        <StatCard 
            title="Total Revenue"
            value={stats ? `PKR ${stats.totalRevenue.toFixed(2)}` : 0}
            icon={DollarSign}
            description="From delivered orders"
            isLoading={isLoading}
        />
        <StatCard 
            title="Orders Today"
            value={stats?.ordersToday ?? 0}
            icon={ShoppingCart}
            description="New orders placed today"
            isLoading={isLoading}
        />
        <StatCard 
            title="New Customers Today"
            value={stats?.newCustomers ?? 0}
            icon={Users}
            description="Unique customers today"
            isLoading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[250px] w-full">
             {isLoading ? <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div> : (
                 <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis stroke="" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `PKR ${Number(value) / 1000}k`} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
             )}
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your 5 most recent orders.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
             {isLoading ? <div className="flex h-full w-full items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div> : recentOrders.length > 0 ? (
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
                            <TableRow key={order.id} className="hover:bg-muted/50 cursor-pointer">
                                <TableCell className="font-medium">
                                    <Link href="/admin/orders" className="block w-full h-full">
                                        {order.id.slice(0, 8)}...
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <Link href="/admin/orders" className="block w-full h-full">
                                        {order.customer.name}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <Link href="/admin/orders" className="block w-full h-full">
                                        <Badge 
                                        variant={
                                            order.status === 'Delivered' ? 'default' : 
                                            order.status === 'Processing' ? 'secondary' : 
                                            'outline'
                                        }
                                        >{order.status}</Badge>
                                    </Link>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href="/admin/orders" className="block w-full h-full">
                                        PKR {order.total.toFixed(2)}
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             ) : (
                <div className="text-center text-muted-foreground py-10">No recent orders.</div>
             )}
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

    

    
