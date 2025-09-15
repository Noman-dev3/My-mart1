'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type Order } from '@/lib/order-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import RoleGate from '@/components/admin/role-gate';

type Customer = {
    email: string;
    name: string;
    totalOrders: number;
    totalSpent: number;
    lastOrder: Date;
}

function CustomersPageContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('');
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchAndAggregateOrders = async () => {
        setIsLoading(true);
        const { data: ordersData, error } = await supabase
            .from('orders')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error("Failed to fetch orders for customer aggregation:", error);
            setIsLoading(false);
            return;
        }

        const orders: Order[] = ordersData.map((order: any) => ({
            ...order,
            date: new Date(order.date),
        }));
        
        const customerData = orders.reduce((acc, order) => {
            const email = order.customer.email;
            if (!acc[email]) {
                acc[email] = {
                    email,
                    name: order.customer.name,
                    totalOrders: 0,
                    totalSpent: 0,
                    lastOrder: order.date,
                };
            }
            acc[email].totalOrders += 1;
            acc[email].totalSpent += order.total;
            if (order.date > acc[email].lastOrder) {
                acc[email].lastOrder = order.date;
            }
            return acc;
        }, {} as Record<string, Customer>);

        const customerList = Object.values(customerData).sort((a,b) => b.lastOrder.getTime() - a.lastOrder.getTime());
        
        setCustomers(customerList);
        setIsLoading(false);
    };

    fetchAndAggregateOrders();

    const channel = supabase
      .channel('customers-page-realtime-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchAndAggregateOrders)
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [supabase]);

 const columns: ColumnDef<Customer>[] = useMemo(() => [
    {
        accessorKey: "name",
        header: "Customer",
         cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-medium">{row.original.name}</div>
                    <div className="text-xs text-muted-foreground">{row.original.email}</div>
                </div>
            </div>
        )
    },
    {
        accessorKey: "lastOrder",
        header: "Last Order",
        cell: ({ row }) => <div>{format(new Date(row.getValue("lastOrder")), "MMM d, yyyy")}</div>,
    },
     {
        accessorKey: "totalOrders",
        header: "Total Orders",
        cell: ({ row }) => <div>{row.getValue("totalOrders")}</div>,
    },
    {
        accessorKey: "totalSpent",
        header: () => <div className="text-right">Total Spent</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalSpent"))
            const formatted = new Intl.NumberFormat("en-PK", {
                style: "currency",
                currency: "PKR",
            }).format(amount)
            return <div className="text-right font-medium">{formatted}</div>
        },
    },
 ], [])

  const table = useReactTable({
    data: customers,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">Customers</h1>
                <p className="text-muted-foreground">View and manage your customers.</p>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <Input
              placeholder="Search by name or email..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
        </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                        Loading customers...
                    </TableCell>
                </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of{" "}
          {customers.length} customer(s) displayed.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
    return (
        <RoleGate role="SUPER_ADMIN">
            <CustomersPageContent />
        </RoleGate>
    )
}
