
'use client';

import { useState } from 'react';
import { Home, Package, ShoppingCart, Users, Settings, Bell, Search, FileText, Store, LogOut, PanelLeft, X, QrCode } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { logout } from './login/actions';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { href: '/admin/products', icon: Package, label: 'Products' },
    { href: '/admin/customers', icon: Users, label: 'Customers' },
    { href: '/admin/store-manager', icon: Store, label: 'Store Manager' },
    { href: '/admin/content', icon: FileText, label: 'Content' },
    { href: '/admin/barcode-tools', icon: QrCode, label: 'Barcode Tools' },
  ];

  const handleLogout = async () => {
    await logout();
  };
  
  const SidebarContent = () => (
    <>
        <div className="flex items-center gap-2 px-4 py-6 border-b border-border/50">
            <Icons.logo className="h-8 w-8 text-primary" />
            <span className="font-headline text-2xl font-bold text-primary">
            My Mart
            </span>
        </div>
        <div className="flex-1 overflow-y-auto">
            <nav className="px-4 py-4">
            <ul className="space-y-1">
                {navItems.map((item) => (
                <li key={item.label}>
                    <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <div
                        className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent",
                        pathname === item.href && "bg-accent text-primary font-semibold"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </div>
                    </Link>
                </li>
                ))}
            </ul>
            </nav>
        </div>
        <div className="mt-auto p-4 border-t border-border/50">
             <form action={handleLogout}>
                <Button type="submit" variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive">
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                </Button>
            </form>
        </div>
    </>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <aside className="hidden border-r bg-card md:flex flex-col">
        <SidebarContent />
      </aside>
      
      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="flex flex-col w-full max-w-[300px] p-0">
           <SheetHeader className="sr-only">
            <SheetTitle>Admin Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <div className="flex flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6 sticky top-0 z-30">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
           <div className='flex items-center gap-4'>
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5"/>
                    <span className="sr-only">Notifications</span>
                </Button>
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block">
                        <p className="font-semibold text-sm">Admin</p>
                        <p className="text-xs text-muted-foreground">Store Operator</p>
                    </div>
                </div>
            </div>
        </header>
        <main className="flex-1 overflow-auto bg-muted/30 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // The login page does not have the admin layout
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }
    
    return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
