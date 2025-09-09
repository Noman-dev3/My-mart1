import Link from 'next/link';
import { ShoppingCart, User, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

type HeaderProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

export default function Header({ searchQuery, setSearchQuery }: HeaderProps) {
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
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md items-center">
          <Input 
            type="search" 
            placeholder="Search products, brands, and categories..." 
            className="h-10 rounded-r-none"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Button type="submit" size="icon" className="h-10 w-10 rounded-l-none">
            <Search className="h-5 w-5" />
          </Button>
        </form>
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="My Account">
            <User className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Shopping Cart">
            <ShoppingCart className="h-6 w-6" />
          </Button>
        </div>
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
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      type="search" 
                      placeholder="Search..." 
                      className="pl-10 h-10"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </form>
                  <Button variant="ghost" className="justify-start gap-2">
                    <User className="h-5 w-5" />
                    My Account
                  </Button>
                  <Button variant="ghost" className="justify-start gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Shopping Cart
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
