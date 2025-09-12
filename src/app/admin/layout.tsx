
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Home, Package, ShoppingCart, Users, Settings, Bell, Search, FileText, Store, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminAuthContext, AdminAuthProvider } from '@/context/admin-auth-context';
import { useContext, useEffect } from 'react';
import AdminLoginPage from './login/page';

function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdminAuthenticated, loading, logout } = useContext(AdminAuthContext);
  
  useEffect(() => {
    if (!loading && !isAdminAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAdminAuthenticated, loading, router]);

  if (loading) {
     return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!isAdminAuthenticated) {
    // While the effect above should redirect, this prevents flicker.
    // We render the login page directly if not authenticated.
    return <AdminLoginPage />;
  }

  const navItems = [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { href: '/admin/products', icon: Package, label: 'Products' },
    { href: '/admin/customers', icon: Users, label: 'Customers' },
    { href: '/admin/store-manager', icon: Store, label: 'Store Manager' },
    { href: '/admin/content', icon: FileText, label: 'Content' },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
             <Icons.logo className="h-8 w-8 text-sidebar-primary" />
             <span className="font-headline text-2xl font-bold text-sidebar-primary group-data-[collapsible=icon]:hidden">
                My Mart
             </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
            <SidebarMenu>
                {navItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                            <Link href={item.href}>
                                <item.icon />
                                <span>{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton onClick={logout} tooltip="Logout">
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 h-9" />
              </div>
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
        <main className="flex-1 overflow-auto p-4 sm:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // The login page should not have the main admin layout
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <AdminAuthProvider>
            <AdminProtectedLayout>{children}</AdminProtectedLayout>
        </AdminAuthProvider>
    )
}
