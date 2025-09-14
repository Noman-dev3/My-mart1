

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
import { ChevronDown, File, ListFilter, MoreHorizontal, Eye, Truck, XCircle, CheckCircle, Printer, Cake } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import InvoiceTemplate from '@/components/invoice-template';
import './invoice.css';
import { logAdminActivity } from '@/lib/admin-actions';

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
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  
  const supabase = createSupabaseBrowserClient();

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
    if (error) {
        console.error("Failed to fetch orders:", error);
        toast({ title: "Error", description: "Failed to fetch orders.", variant: "destructive" });
        setIsLoading(false);
    } else {
        setOrders(data as Order[]);
        setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchOrders();

    const channel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Change received!', payload)
          fetchOrders();
        }
      )
      .subscribe()

      return () => {
        supabase.removeChannel(channel);
      }
  }, [supabase, toast]);
  
  useEffect(() => {
    if (orderToPrint) {
      const timer = setTimeout(() => {
        window.print();
        setOrderToPrint(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [orderToPrint]);

  const handlePrint = (order: Order) => {
    setOrderToPrint(order);
  }

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    const originalOrder = orders.find(o => o.id === orderId);
    if (!originalOrder) return;
    
    try {
        const updatedOrder = await updateOrderStatus(orderId, status);
        await logAdminActivity({
            action: 'Updated order status',
            details: `Order ${orderId.slice(0,8)} from "${originalOrder.status}" to "${status}"`
        });
        toast({
            title: "Success",
            description: `Order ${orderId.slice(0,8)}... has been updated to "${status}".`
        });
        // Close the dialog if the selected order was updated
        if (selectedOrder && selectedOrder.id === orderId) {
           setSelectedOrder(prev => prev ? { ...prev, status: updatedOrder.status } : null);
        }

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
        cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("id")}</div>,
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
                status === 'Bakery Order' ? 'secondary' :
                'outline';
            const Icon = status === 'Bakery Order' ? Cake : null;

            return <Badge variant={variant} className="capitalize">
                {Icon && <Icon className="mr-1 h-3 w-3" />}
                {status}
            </Badge>
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
                         <DropdownMenuItem onClick={() => handlePrint(order)}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Bill
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

  const statusOptions: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Bakery Order'];

  const handleExport = () => {
    const dataToExport = table.getFilteredRowModel().rows.map(row => row.original);
    
    if (dataToExport.length === 0) {
      toast({ title: "No Data", description: "There is no data to export." });
      return;
    }

    const headers = ["Order ID", "Customer Name", "Customer Email", "Status", "Total", "Date", "Payment Method"];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(order => [
        `"${order.id}"`,
        `"${order.customer.name}"`,
        `"${order.customer.email}"`,
        order.status,
        order.total,
        format(new Date(order.date), 'yyyy-MM-dd HH:mm:ss'),
        order.paymentMethod,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mymart_orders_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <>
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">Orders</h1>
                <p className="text-muted-foreground">Manage all customer orders.</p>
            </div>
            <div className="flex gap-2 self-start sm:self-center">
                <Button variant="outline" onClick={handleExport}>
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
                            selectedOrder.status === 'Bakery Order' ? 'secondary' :
                            'outline'
                        } className="capitalize">{selectedOrder.status}</Badge></p>
                        <p>Total: <span className="font-bold">PKR {selectedOrder.total.toFixed(2)}</span></p>
                    </div>
                        <div>
                        <h4 className="font-semibold mb-2">Payment</h4>
                        <p>Method: {selectedOrder.paymentMethod}</p>
                        {selectedOrder.paymentMethod === 'Online' && selectedOrder.status === 'Pending' && (
                             <div className="mt-2">
                                <p className="text-yellow-600 text-xs mb-2">Awaiting payment confirmation.</p>
                                <Button size="sm" onClick={() => handleUpdateStatus(selectedOrder.id, 'Processing')}>
                                    <CheckCircle className="mr-2 h-4 w-4"/>
                                    Approve Payment
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Items</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {selectedOrder.items.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <Image src={item.image} alt={item.name} width={48} height={48} className="rounded" />
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity} x PKR {item.price.toFixed(2)}</p>
                                        {item.customization && (
                                            <p className="text-xs text-primary bg-primary/10 p-1 rounded-sm mt-1">Custom: {item.customization}</p>
                                        )}
                                    </div>
                                </div>
                                <p className="font-medium">PKR {(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <DialogFooter>
                     <Button type="button" variant="outline" onClick={() => handlePrint(selectedOrder)}>
                        <Printer className="mr-2 h-4 w-4" /> Print Bill
                    </Button>
                    <DialogClose asChild>
                        <Button type="button">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        )}
    </Dialog>

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
    
    {orderToPrint && (
        <div className="invoice-container">
            <InvoiceTemplate order={orderToPrint} />
        </div>
    )}
    </>
  );
}
