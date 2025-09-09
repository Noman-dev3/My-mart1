
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
import { Home, Package, ShoppingCart, Users, LineChart, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { href: '/admin/products', icon: Package, label: 'Products' },
    { href: '/admin/customers', icon: Users, label: 'Customers' },
    { href: '/admin/analytics', icon: LineChart, label: 'Analytics' },
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
                    <SidebarMenuButton asChild isActive={pathname === '/admin/settings'} tooltip="Settings">
                        <Link href="#">
                            <Settings />
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <div className="flex items-center gap-3 p-2 group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:justify-center">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://picsum.photos/100" alt="Admin" />
                            <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow group-data-[collapsible=icon]:hidden">
                            <p className="font-semibold text-sm">Admin User</p>
                            <p className="text-xs text-sidebar-foreground/70">admin@mymart.com</p>
                        </div>
                    </div>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-2xl font-semibold font-headline">Dashboard</h1>
            </div>
            <Button asChild>
                <Link href="/">View Store</Link>
            </Button>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-muted/30">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
