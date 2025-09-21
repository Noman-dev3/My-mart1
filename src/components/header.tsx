
'use client';

import Link from 'next/link';
import { Search, Menu, User, Moon, Sun, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { CartSheet } from '@/components/cart-sheet';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '@/context/auth-context';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { signOutUser } from '@/lib/auth-actions';
import { ShoppingCart } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';


export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showSearch = pathname.startsWith('/products');
  const { user, loading } = useContext(AuthContext);
  const { setTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Sync search input with URL params on navigation
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (!searchQuery) {
      current.delete('q');
    } else {
      current.set('q', searchQuery);
    }
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  };
  
  const handleLogout = async () => {
    await signOutUser();
    // The AuthProvider will handle the redirect and refresh
  };
  
  const userInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U';

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
          <Link href="/bakery" className="text-sm font-medium hover:text-primary transition-colors">Bakery</Link>
        </nav>

        <div className="flex items-center gap-2">
          <CartSheet />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {loading ? null : user ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.user_metadata.full_name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="icon">
                <Link href="/login">
                    <User className="h-6 w-6" />
                </Link>
            </Button>
          )}

          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader className="p-4 border-b">
                   <VisuallyHidden>
                    <SheetTitle>Mobile Menu</SheetTitle>
                  </VisuallyHidden>
                  <div className="flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                      <Icons.logo className="h-6 w-6 text-primary" />
                      <span className="font-headline text-xl font-bold text-primary">My Mart</span>
                    </Link>
                    <SheetClose>
                      <X className="h-6 w-6" />
                    </SheetClose>
                  </div>
                </SheetHeader>
                <div className="p-4 flex-1 flex flex-col gap-4">
                  {showSearch && (
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
                  )}
                  <nav className="flex flex-col gap-2 mb-auto">
                    <Link href="/" className="text-lg font-medium hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    <Link href="/products" className="text-lg font-medium hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Products</Link>
                    <Link href="/bakery" className="text-lg font-medium hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Bakery</Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
