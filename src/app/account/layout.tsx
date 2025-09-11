
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { signOutUser } from '@/lib/auth-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, ShoppingCart, LogOut, LayoutDashboard } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="container mx-auto px-4 py-8 flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <div className="md:col-span-3">
                         <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }
  
  const userInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U';
  const isAdmin = user?.user_metadata?.role === 'admin';

  const navItems = [
    { href: '/account', icon: User, label: 'My Profile' },
    { href: '/account/orders', icon: ShoppingCart, label: 'My Orders' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-muted/30">
        <div className="container mx-auto px-4 py-12">
           <div className="text-center md:text-left mb-10">
            <h1 className="text-4xl font-headline font-bold">My Account</h1>
            <p className="text-muted-foreground">Manage your profile, orders, and settings.</p>
           </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <aside className="lg:col-span-1">
              <div className="bg-card p-4 rounded-lg shadow-sm">
                <div className="flex flex-col items-center text-center mb-6">
                    <Avatar className="h-20 w-20 mb-3">
                        <AvatarFallback className="text-3xl">{userInitial}</AvatarFallback>
                    </Avatar>
                    <h2 className="font-semibold text-lg">{user.user_metadata.full_name}</h2>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={pathname === item.href ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                   {isAdmin && (
                     <Link href="/admin">
                        <Button
                          variant='ghost'
                          className="w-full justify-start"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Button>
                      </Link>
                   )}
                  <form action={signOutUser} className="w-full">
                    <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                  </form>
                </nav>
              </div>
            </aside>
            <section className="lg:col-span-3">
                <div className="bg-card p-6 sm:p-8 rounded-lg shadow-sm min-h-[400px]">
                    {children}
                </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
