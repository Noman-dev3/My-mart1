'use client';

import Link from 'next/link';
import { Search, Menu, User, Moon, Sun, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
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
import { signOutUser } from '@/lib/auth-client-actions'; // Updated import
import { ShoppingCart } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useToast } from '@/hooks/use-toast';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Categories', href: '/products' },
  { label: 'Services', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showSearch = pathname.startsWith('/products');
  const { user, loading } = useContext(AuthContext);
  const { setTheme } = useTheme();
  const { toast } = useToast();

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
    toast({
      title: 'Signed Out',
      description: 'You have been successfully signed out.',
    });
    router.push('/');
  };

  const userInitial =
    user?.user_metadata?.full_name?.charAt(0) ||
    user?.email?.charAt(0) ||
    'U';

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-50 bg-[radial-gradient(circle_at_top,_#ffffff,_#f4ffe5)]/90 backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Sheet
            open={isMobileMenuOpen}
            onOpenChange={setIsMobileMenuOpen}
          >
            <SheetTrigger asChild>
              <button
                className="rounded-full border border-emerald-100 p-2 text-emerald-500 transition-colors hover:bg-emerald-50 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="p-4 border-b">
                <VisuallyHidden>
                  <SheetTitle>Navigation</SheetTitle>
                </VisuallyHidden>
                <div className="flex justify-between items-center">
                  <Link
                    href="/"
                    className="flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icons.logo className="h-6 w-6 text-primary" />
                    <span className="font-headline text-xl font-bold text-primary">
                      My Mart
                    </span>
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
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                {!user && (
                  <div className="flex gap-3">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        Log in
                      </Link>
                    </Button>
                    <Button asChild className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                      <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        Sign up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <Icons.logo className="h-8 w-8 text-primary" />
            <span className="font-headline text-3xl font-bold text-primary">
              My Mart
            </span>
          </Link>
        </div>

        <nav className="hidden flex-1 items-center justify-center rounded-full border border-emerald-100 bg-white/70 px-6 py-2 text-sm font-medium text-gray-600 shadow-sm lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-1 transition-colors',
                isActiveLink(link.href)
                  ? 'text-emerald-600'
                  : 'hover:text-emerald-500'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {showSearch && (
            <form
              onSubmit={handleSearchSubmit}
              className="hidden xl:flex max-w-xs items-center rounded-full border border-emerald-100 bg-white/80 px-4"
            >
              <Search className="mr-2 h-4 w-4 text-emerald-400" />
              <Input
                type="search"
                placeholder="Search products..."
                className="h-10 border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </form>
          )}

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
              <DropdownMenuItem onClick={() => setTheme('light')}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {loading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full border border-emerald-100"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{userInitial}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata.full_name || 'User'}
                    </p>
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
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" className="rounded-full border border-emerald-100 px-5">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="rounded-full bg-emerald-500 px-6 font-semibold hover:bg-emerald-600">
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
