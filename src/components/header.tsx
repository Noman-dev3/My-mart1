import Link from 'next/link';
import { ShoppingCart, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';

type HeaderProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

export default function Header({ searchQuery, setSearchQuery }: HeaderProps) {
  const pathname = usePathname();
  const showSearch = pathname.startsWith('/products');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Potentially trigger a search action if needed, for now it filters live
  };
  
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Icons.logo className="h-8 w-8 text-primary" />
          <span className="font-headline text-3xl font-bold text-primary">My Mart</span>
        </Link>
        
        {showSearch ? (
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md items-center">
            <Input 
              type="search" 
              placeholder="Search products..." 
              className="h-10 rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Button type="submit" size="icon" className="h-10 w-10 rounded-l-none">
              <Search className="h-5 w-5" />
            </Button>
          </form>
        ) : <div className="hidden md:block flex-1" /> }

        <nav className="hidden md:flex items-center gap-4">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
          <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">Products</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Shopping Cart">
            <ShoppingCart className="h-6 w-6" />
          </Button>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <Link href="/" className="flex items-center gap-2">
                      <Icons.logo className="h-6 w-6 text-primary" />
                      <span className="font-headline text-xl font-bold text-primary">My Mart</span>
                    </Link>
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-4">
                    {showSearch && (
                      <form onSubmit={handleSearchSubmit} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                          type="search" 
                          placeholder="Search..." 
                          className="pl-10 h-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                          value={searchQuery}
                          onChange={handleSearchChange}
                        />
                      </form>
                    )}
                    <nav className="flex flex-col gap-2">
                      <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">Home</Link>
                      <Link href="/products" className="text-lg font-medium hover:text-primary transition-colors">Products</Link>
                    </nav>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
