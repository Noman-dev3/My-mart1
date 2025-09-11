
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
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Order } from '@/lib/order-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

type Customer = {
    email: string;
    name: string;
    totalOrders: number;
    totalSpent: number;
    lastOrder: Date;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'orders'), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => {
            const data = doc.data();
            return { ...data, date: data.date?.toDate() || new Date() } as Order;
        });

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
    }, (error) => {
        console.error("Failed to fetch orders for customer aggregation:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
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

      <div className="rounded-lg border">
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
