
'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
    DialogHeader,
    DialogTitle,
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
} from "@tanstack/react-table"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addProduct, deleteProduct, updateProduct, type Product } from '@/lib/product-actions';
import type { ProductFormValues } from '@/lib/schemas';
import { MoreHorizontal, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import ProductForm from './product-form';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { logAdminActivity } from '@/lib/admin-actions';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const { toast } = useToast();
  const supabase = createSupabaseBrowserClient();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error("Failed to fetch products:", error);
        toast({ title: "Error", description: "Failed to fetch products.", variant: "destructive" });
    } else {
        setProducts(data as Product[]);
    }
    setIsLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('realtime-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
      .subscribe();
    
    return () => {
        supabase.removeChannel(channel);
    }
  }, [fetchProducts, supabase]);
  
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  }

  const handleDeleteTrigger = (product: Product) => {
    setProductToDelete(product);
    setIsAlertOpen(true);
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
        await deleteProduct(productToDelete.id);
        await logAdminActivity({
            action: 'Deleted product',
            details: `Product: ${productToDelete.name}`
        });
        toast({ title: "Success", description: "Product deleted successfully." });
    } catch (error) {
        toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
    } finally {
        setProductToDelete(null);
        setIsAlertOpen(false);
    }
  }
  
  const onFormSubmit = async (values: ProductFormValues) => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, values);
        await logAdminActivity({
          action: 'Updated product',
          details: `Product: ${values.name}`,
        });
        toast({ title: 'Success', description: 'Product updated successfully.' });
      } else {
        await addProduct(values);
        await logAdminActivity({
          action: 'Added new product',
          details: `Product: ${values.name}`,
        });
        toast({ title: 'Success', description: 'Product added successfully.' });
      }
      setIsFormOpen(false);
      setSelectedProduct(undefined);
      return true; // Indicate success
    } catch (error: any) {
       console.error("Save Product Error:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save product.',
        variant: 'destructive',
      });
      return false; // Indicate failure
    }
  };


 const columns: ColumnDef<Product>[] = useMemo(() => [
    {
        accessorKey: "image",
        header: "",
        cell: ({ row }) => (
            <Image 
                src={row.original.image}
                alt={row.original.name}
                width={64}
                height={64}
                className="rounded-md object-cover"
            />
        ),
        enableSorting: false,
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "barcode",
        header: "Barcode",
        cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("barcode")}</div>,
    },
    {
        accessorKey: "price",
        header: () => <div className="text-right">Price</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.original.price as any)
            const formatted = new Intl.NumberFormat("en-PK", {
                style: "currency",
                currency: "PKR",
            }).format(amount)
            return <div className="text-right font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "stockQuantity",
        header: "Stock",
        cell: ({ row }) => {
            const stock = row.getValue("stockQuantity") as number;
            return stock > 0 ? 
                <Badge variant="secondary">{stock} in Stock</Badge> : 
                <Badge variant="destructive">Out of Stock</Badge>;
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original;

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
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDeleteTrigger(product)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Product
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
 ], []) // eslint-disable-line react-hooks/exhaustive-deps

  const table = useReactTable({
    data: products,
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
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                  <h1 className="text-3xl font-bold font-headline">Products</h1>
                  <p className="text-muted-foreground">Manage your store's products.</p>
              </div>
              <Button className="self-start sm:self-center" onClick={() => {
                  setSelectedProduct(undefined);
                  setIsFormOpen(true);
              }}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Product
              </Button>
          </div>

          <div className="flex items-center gap-2">
              <Input
              placeholder="Search by name, category, or barcode..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="w-full md:max-w-sm"
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
                            Loading products...
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
            {products.length} product(s) displayed.
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
      
      <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setSelectedProduct(undefined);
      }}>
          <DialogContent className="sm:max-w-md md:max-w-lg">
              <DialogHeader>
                  <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <ProductForm 
                  onSubmit={onFormSubmit}
                  product={selectedProduct}
                  onCancel={() => {
                      setIsFormOpen(false);
                      setSelectedProduct(undefined);
                  }}
              />
          </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the product &quot;{productToDelete?.name}&quot;.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
