
import Link from 'next/link';
import { Search, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { CartSheet } from '@/components/cart-sheet';
import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
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
import { ShoppingCart, LayoutDashboard } from 'lucide-react';

type HeaderProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

export default function Header({ searchQuery, setSearchQuery }: HeaderProps) {
  const pathname = usePathname();
  const showSearch = pathname.startsWith('/products');
  const { user, loading } = useContext(AuthContext);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };
  
  const userInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U';
  const isAdmin = user?.user_metadata?.role === 'admin';

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
          <CartSheet />
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
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Admin</span>
                        </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <form action={signOutUser}>
                    <button type="submit" className="w-full">
                      <DropdownMenuItem>
                        Log out
                      </DropdownMenuItem>
                    </button>
                  </form>
                </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                </SheetHeader>
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
                    <nav className="flex flex-col gap-2 mb-auto">
                      <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">Home</Link>
                      <Link href="/products" className="text-lg font-medium hover:text-primary transition-colors">Products</Link>
                    </nav>
                     {user ? (
                        <div className="border-t pt-4">
                            <p className="font-medium">{user.user_metadata.full_name || 'User'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex flex-col gap-2 mt-4">
                                <Button asChild className="w-full"><Link href="/account">My Account</Link></Button>
                                <form action={signOutUser}>
                                  <Button type="submit" variant="outline" className="w-full">Log Out</Button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 border-t pt-4">
                            <Button asChild className="w-full"><Link href="/login">Login</Link></Button>
                            <Button asChild variant="outline" className="w-full"><Link href="/signup">Sign Up</Link></Button>
                        </div>
                    )}
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
