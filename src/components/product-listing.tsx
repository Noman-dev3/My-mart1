
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Product } from '@/lib/placeholder-data';
import { getCategories, getBrands } from '@/lib/placeholder-data';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ListFilter } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from './ui/separator';

export default function ProductListing({ products, searchQuery }: { products: Product[], searchQuery: string }) {
  const [sortOrder, setSortOrder] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    const fetchFilters = async () => {
        const [fetchedCategories, fetchedBrands] = await Promise.all([
            getCategories(),
            getBrands()
        ]);
        setCategories(fetchedCategories);
        setBrands(fetchedBrands);
    };
    fetchFilters();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    
    let result = products
      .filter((p) => {
        if (!searchQuery) return true;
        return (
          p.name.toLowerCase().includes(lowercasedQuery) ||
          p.description.toLowerCase().includes(lowercasedQuery) ||
          p.brand.toLowerCase().includes(lowercasedQuery) ||
          p.category.toLowerCase().includes(lowercasedQuery)
        );
      })
      .filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
      .filter((p) => (selectedCategories.length > 0 ? selectedCategories.includes(p.category) : true))
      .filter((p) => (selectedBrands.length > 0 ? selectedBrands.includes(p.brand) : true))
      .filter((p) => p.rating >= selectedRating)
      .filter((p) => (inStockOnly ? p.inStock : true));

    switch (sortOrder) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        result.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'newest':
      default:
        // Assuming higher ID is newer for mock data
        result.sort((a, b) => (b.id > a.id ? 1 : -1));
        break;
    }

    return result;
  }, [products, searchQuery, sortOrder, priceRange, selectedCategories, selectedBrands, selectedRating, inStockOnly]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]));
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 500 || selectedRating > 0 || inStockOnly;

  const clearFilters = () => {
    setPriceRange([0, 500]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedRating(0);
    setInStockOnly(false);
  };

  const renderFilters = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h4 className="font-headline text-lg font-semibold">Category</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox id={`cat-${category}`} checked={selectedCategories.includes(category)} onCheckedChange={() => handleCategoryChange(category)} />
              <Label htmlFor={`cat-${category}`} className="cursor-pointer">{category}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-headline text-lg font-semibold">Price Range</h4>
        <Slider
          min={0}
          max={500}
          step={10}
          value={priceRange}
          onValueChange={setPriceRange}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <Separator />
      
      <div className="space-y-4">
        <h4 className="font-headline text-lg font-semibold">Brand</h4>
        <ScrollArea className="h-40">
          <div className="space-y-2">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox id={`brand-${brand}`} checked={selectedBrands.includes(brand)} onCheckedChange={() => handleBrandChange(brand)} />
                <Label htmlFor={`brand-${brand}`} className="cursor-pointer">{brand}</Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-headline text-lg font-semibold">Rating</h4>
        <div className="flex items-center space-x-2">
          {[1,2,3,4,5].map(rating => (
            <Button key={rating} variant={selectedRating === rating ? 'default' : 'outline'} size="sm" onClick={() => setSelectedRating(rating === selectedRating ? 0 : rating)}>
              {rating}+
            </Button>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="in-stock" checked={inStockOnly} onCheckedChange={(checked) => setInStockOnly(!!checked)} />
          <Label htmlFor="in-stock" className="cursor-pointer">In Stock Only</Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
        <aside className="hidden lg:block">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline text-2xl font-bold">Filters</h3>
            {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary hover:text-primary">Clear all</Button>}
          </div>
          {renderFilters()}
        </aside>

        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-4 mb-6 gap-4">
            <div className="flex items-center gap-2">
                <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                        <Button variant="outline">
                            <ListFilter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                        </SheetTrigger>
                        <SheetContent>
                        <SheetHeader className="mb-6">
                            <SheetTitle className="font-headline text-2xl font-bold">Filters</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(100%-80px)] pr-4">
                          {renderFilters()}
                        </ScrollArea>
                        </SheetContent>
                    </Sheet>
                </div>
                <p className="text-sm text-muted-foreground">{filteredAndSortedProducts.length} products</p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="sort" className="text-sm">Sort by</Label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger id="sort" className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="font-headline text-2xl font-semibold">No Products Found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your filters or clearing them to see all products.</p>
              <Button onClick={clearFilters} className="mt-4">Clear Filters</Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
