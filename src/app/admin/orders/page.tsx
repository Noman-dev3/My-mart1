

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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateOrderStatus, type Order } from '@/lib/order-actions';
import { ChevronDown, File, ListFilter, MoreHorizontal, Eye, Truck, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'orders'), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedOrders = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date?.toDate().toISOString() || new Date().toISOString(),
            } as Order;
        });
        setOrders(fetchedOrders);
        setIsLoading(false);
    }, (error) => {
        console.error("Failed to fetch orders:", error);
        toast({ title: "Error", description: "Failed to fetch orders.", variant: "destructive" });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
        await updateOrderStatus(orderId, status);
        toast({
            title: "Success",
            description: `Order ${orderId} has been updated to "${status}".`
        });
        // No need to fetch orders, real-time listener will update it
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to update order status.",
            variant: "destructive"
        });
    }
  }

 const columns: ColumnDef<Order>[] = useMemo(() => [
    {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    },
    {
        accessorKey: "customer.name",
        header: "Customer",
         cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.original.customer.name}</div>
                <div className="text-xs text-muted-foreground">{row.original.customer.email}</div>
            </div>
        )
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as Order['status'];
            const variant: 'default' | 'secondary' | 'outline' | 'destructive' = 
                status === 'Delivered' ? 'default' :
                status === 'Shipped' ? 'default' :
                status === 'Processing' ? 'secondary' :
                status === 'Cancelled' ? 'destructive' :
                'outline';

            return <Badge variant={variant} className="capitalize">{status}</Badge>
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "total",
        header: () => <div className="text-right">Total</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("total"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)
            return <div className="text-right font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => <div>{format(new Date(row.getValue("date")), "MMM d, yyyy")}</div>,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const order = row.original;
            const statusOptions: Order['status'][] = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

            return (
                <Dialog>
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DialogTrigger asChild>
                                    <DropdownMenuItem>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Order
                                    </DropdownMenuItem>
                                </DialogTrigger>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <Truck className="mr-2 h-4 w-4" />
                                        Update Status
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuLabel>Set status</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {statusOptions.map(status => (
                                            <DropdownMenuItem key={status} onClick={() => handleUpdateStatus(order.id, status)} disabled={order.status === status}>
                                                {status}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Cancel Order
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        
                        {/* Cancel Order Confirmation */}
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will cancel the order <span className="font-bold">{order.id}</span>. This cannot be undone.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Dismiss</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleUpdateStatus(order.id, 'Cancelled')}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* View Order Details */}
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                        <DialogTitle>Order Details - {order.id}</DialogTitle>
                        <DialogDescription>
                            Placed on {format(new Date(order.date), "MMMM d, yyyy 'at' h:mm a")}
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                            <div>
                                <h4 className="font-semibold mb-2">Customer</h4>
                                <p>{order.customer.name}</p>
                                <p>{order.customer.email}</p>
                                <p>{order.customer.phone}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Order Info</h4>
                                <p>Status: <Badge variant={
                                    order.status === 'Delivered' ? 'default' :
                                    order.status === 'Shipped' ? 'default' :
                                    order.status === 'Processing' ? 'secondary' :
                                    order.status === 'Cancelled' ? 'destructive' :
                                    'outline'
                                } className="capitalize">{order.status}</Badge></p>
                                <p>Total: <span className="font-bold">${order.total.toFixed(2)}</span></p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Items</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <Image src={item.image} alt={item.name} width={48} height={48} className="rounded" />
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button">Close</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )
        },
    },
 ], [])

  const table = useReactTable({
    data: orders,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      globalFilter,
      columnVisibility
    },
  });

  const statusOptions: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];


  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">Orders</h1>
                <p className="text-muted-foreground">Manage all customer orders.</p>
            </div>
            <div className="flex gap-2 self-start sm:self-center">
                <Button variant="outline">
                    <File className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search by ID, name, or email..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  <ListFilter className="mr-2 h-4 w-4" /> Status <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {statusOptions.map((status) => (
                    <DropdownMenuCheckboxItem
                        key={status}
                        className="capitalize"
                        checked={(table.getColumn("status")?.getFilterValue() as string[] ?? []).includes(status)}
                        onCheckedChange={(value) => {
                            const currentFilter = (table.getColumn("status")?.getFilterValue() as string[] ?? []);
                            const newFilter = value ? [...currentFilter, status] : currentFilter.filter(s => s !== status);
                            table.getColumn("status")?.setFilterValue(newFilter.length ? newFilter : undefined);
                        }}
                    >
                        {status}
                    </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table.getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id.replace('.', ' ')}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
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
                        Loading orders...
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of{" "}
          {orders.length} order(s) displayed.
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
