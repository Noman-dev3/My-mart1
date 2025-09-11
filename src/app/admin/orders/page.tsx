

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
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
import { ChevronDown, File, ListFilter, MoreHorizontal, Eye, Truck, XCircle, CheckCircle } from 'lucide-react';
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

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to update order status.",
            variant: "destructive"
        });
    }
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  }

  const handleCancelTrigger = (order: Order) => {
    setSelectedOrder(order);
    setIsAlertOpen(true);
  }
  
  const handleCancelConfirm = async () => {
    if (!selectedOrder) return;
    await handleUpdateStatus(selectedOrder.id, 'Cancelled');
    setIsAlertOpen(false);
    setSelectedOrder(null);
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
            const formatted = new Intl.NumberFormat("en-PK", {
                style: "currency",
                currency: "PKR",
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Order
                        </DropdownMenuItem>
                        {order.status === 'Pending' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Processing')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve Payment
                            </DropdownMenuItem>
                        )}
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
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleCancelTrigger(order)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Order
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
 ], []) // eslint-disable-line react-hooks/exhaustive-deps

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
    <>
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

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
            <Input
              placeholder="Search by ID, name, or email..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="w-full md:max-w-sm"
            />
            <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto justify-between">
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
                    <Button variant="outline" className="w-full sm:w-auto justify-between">
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of{" "}
          {orders.length} order(s) displayed.
        </div>
        <div className="flex items-center space-x-2">
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
    
    {/* Order Details Dialog */}
    <Dialog open={isDetailsOpen} onOpenChange={open => {
        setIsDetailsOpen(open);
        if (!open) setSelectedOrder(null);
    }}>
        {selectedOrder && (
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Order Details - {selectedOrder.id}</DialogTitle>
                    <DialogDescription>
                        Placed on {format(new Date(selectedOrder.date), "MMMM d, yyyy 'at' h:mm a")}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                    <div>
                        <h4 className="font-semibold mb-2">Customer</h4>
                        <p>{selectedOrder.customer.name}</p>
                        <p>{selectedOrder.customer.email}</p>
                        <p>{selectedOrder.customer.phone}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Order Info</h4>
                        <p>Status: <Badge variant={
                            selectedOrder.status === 'Delivered' ? 'default' :
                            selectedOrder.status === 'Shipped' ? 'default' :
                            selectedOrder.status === 'Processing' ? 'secondary' :
                            selectedOrder.status === 'Cancelled' ? 'destructive' :
                            'outline'
                        } className="capitalize">{selectedOrder.status}</Badge></p>
                        <p>Total: <span className="font-bold">PKR {selectedOrder.total.toFixed(2)}</span></p>
                    </div>
                        <div>
                        <h4 className="font-semibold mb-2">Payment</h4>
                        <p>Method: {selectedOrder.paymentMethod}</p>
                        {selectedOrder.paymentMethod === 'Online' && selectedOrder.status === 'Pending' && (
                                <p className="text-yellow-600 text-xs mt-1">Awaiting payment confirmation.</p>
                        )}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Items</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {selectedOrder.items.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <Image src={item.image} alt={item.name} width={48} height={48} className="rounded" />
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity} x PKR {item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                                <p className="font-medium">PKR {(item.price * item.quantity).toFixed(2)}</p>
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
        )}
    </Dialog>

    {/* Cancel Confirmation Alert */}
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action will cancel the order <span className="font-bold">{selectedOrder?.id}</span>. This cannot be undone.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedOrder(null)}>Dismiss</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm}>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
