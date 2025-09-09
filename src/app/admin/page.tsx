
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Package, CreditCard, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';

const chartData = [
  { month: 'Jan', total: Math.floor(Math.random() * 2000) + 1000 },
  { month: 'Feb', total: Math.floor(Math.random() * 2000) + 1000 },
  { month: 'Mar', total: Math.floor(Math.random() * 2000) + 1000 },
  { month: 'Apr', total: Math.floor(Math.random() * 2000) + 1000 },
  { month: 'May', total: Math.floor(Math.random() * 2000) + 1000 },
  { month: 'Jun', total: Math.floor(Math.random() * 3000) + 2000 },
  { month: 'Jul', total: Math.floor(Math.random() * 3000) + 2000 },
  { month: 'Aug', total: Math.floor(Math.random() * 3000) + 2000 },
  { month: 'Sep', total: Math.floor(Math.random() * 3000) + 2000 },
  { month: 'Oct', total: Math.floor(Math.random() * 4000) + 2500 },
  { month: 'Nov', total: Math.floor(Math.random() * 4000) + 2500 },
  { month: 'Dec', total: Math.floor(Math.random() * 5000) + 3000 },
];

const chartConfig = {
  total: {
    label: 'Total',
    color: 'hsl(var(--chart-1))',
  },
};

const recentOrders = [
    { id: 'ORD001', customer: 'Olivia Martin', email: 'olivia.martin@email.com', amount: 49.99, status: 'Shipped' },
    { id: 'ORD002', customer: 'Jackson Lee', email: 'jackson.lee@email.com', amount: 129.50, status: 'Processing' },
    { id: 'ORD003', customer: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: 32.00, status: 'Delivered' },
    { id: 'ORD004', customer: 'William Kim', email: 'will@email.com', amount: 250.00, status: 'Shipped' },
    { id: 'ORD005', customer: 'Sofia Davis', email: 'sofia.davis@email.com', amount: 75.75, status: 'Cancelled' },
];


export default function AdminDashboard() {
  return (
    <div className="space-y-6">
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
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 since last hour</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>An overview of your sales performance for the year.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  stroke=""
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                 <YAxis stroke="" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value / 1000}k`} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area type="monotone" dataKey="total" stroke="var(--color-total)" fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>A list of the most recent orders.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentOrders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>
                                <div className="font-medium">{order.customer}</div>
                                <div className="text-sm text-muted-foreground">{order.email}</div>
                            </TableCell>
                            <TableCell>${order.amount.toFixed(2)}</TableCell>
                            <TableCell>
                                <Badge variant={
                                    order.status === 'Shipped' ? 'default' :
                                    order.status === 'Processing' ? 'secondary' :
                                    order.status === 'Delivered' ? 'outline' :
                                    'destructive'
                                }>{order.status}</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
