
'use client';

import { useState, useEffect, Suspense, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { verifyRolePassword, type AdminRole } from '@/lib/role-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Bell, Menu } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Sidebar from '@/components/admin/sidebar';
import { Icons } from '../icons';

type RoleGateProps = {
  role: AdminRole;
  children: React.ReactNode;
};

// --- Main RoleGate Component ---

export default function RoleGate({ role, children }: RoleGateProps) {
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const sessionKey = `myMart-role-${role}`;
    try {
      const hasSession = sessionStorage.getItem(sessionKey) === 'true';
      if (hasSession) {
        setAuthStatus('authenticated');
      } else {
        setAuthStatus('unauthenticated');
      }
    } catch (e) {
      // sessionStorage is not available, likely on server.
      // Default to unauthenticated.
      setAuthStatus('unauthenticated');
    }
  }, [role]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const isValid = await verifyRolePassword(role, password);

    if (isValid) {
      sessionStorage.setItem(`myMart-role-${role}`, 'true');
      setShowSuccess(true);
      setTimeout(() => {
        setAuthStatus('authenticated');
        setShowSuccess(false);
      }, 1500); // Match animation exit time
    } else {
      setError('Incorrect password. Please try again.');
      setIsLoading(false);
    }
  };
  
  const roleName = role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Render based on the authentication status
  if (authStatus === 'checking') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authStatus === 'authenticated') {
    return <AdminLayoutContent>{children}</AdminLayoutContent>;
  }
  
  if (authStatus === 'unauthenticated') {
     return (
        <div className="flex h-screen w-full items-center justify-center p-4 bg-muted/30">
            <AnimatePresence>
                {showSuccess ? (
                    <SuccessAnimation roleName={roleName} />
                ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="relative w-full max-w-4xl min-h-[600px] grid lg:grid-cols-2 shadow-2xl overflow-hidden rounded-2xl bg-card"
                    >
                        <div className="p-8 sm:p-12 flex flex-col justify-center">
                            <Link href="/" className="w-fit mb-8 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                                <Icons.logo className="h-6 w-6"/>
                                <span className="font-headline text-xl font-semibold">{process.env.NEXT_PUBLIC_STORE_NAME || 'My Mart'}</span>
                            </Link>

                            <h1 className="font-headline text-3xl font-bold">Good day!</h1>
                            <p className="text-muted-foreground mt-2">Please enter the password for the <span className="font-semibold text-foreground">{roleName}</span> role to continue.</p>

                            <form onSubmit={handleLogin} className="mt-8 space-y-4">
                                <div>
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                        className="mt-1"
                                    />
                                    {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 animate-spin" /> : null}
                                Unlock Access
                                </Button>
                            </form>
                        </div>
                        <div className="hidden lg:block relative">
                            <Image
                                src="https://picsum.photos/seed/cat-desk/800/1200"
                                alt="Desk with a cat"
                                fill
                                className="object-cover"
                                data-ai-hint="desk cat"
                            />
                            <div className="absolute inset-0 bg-blue-500/70 mix-blend-multiply" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                            <div className="absolute bottom-12 left-12 text-white">
                                <h2 className="font-headline text-3xl font-bold">My Mart Admin</h2>
                                <p className="max-w-xs mt-2 text-white/80">Manage your store with ease. If you encounter any issues, our support team is ready to help.</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      );
  }

  // Fallback for checking state or other edge cases.
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

// --- Success Animation Component ---

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2,
      duration: 0.6
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

function SuccessAnimation({ roleName }: { roleName: string }) {
    return (
        <motion.div
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute z-10 text-center p-8 bg-card rounded-2xl shadow-2xl"
        >
            <h2 className="text-4xl font-headline font-bold text-primary">Access Granted</h2>
            <p className="text-muted-foreground mt-2">Logged in as {roleName}</p>
        </motion.div>
    )
}

// --- Admin Layout Content ---
// This is the actual UI for the admin panel, which is now rendered by the RoleGate upon success.

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.setAttribute('data-lenis-stop', 'true');
    } else {
      document.body.removeAttribute('data-lenis-stop');
    }
    
    return () => {
        document.body.removeAttribute('data-lenis-stop');
    }
  }, [isMobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    // Clear all role sessions to force re-authentication
    Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('myMart-role-')) {
            sessionStorage.removeItem(key);
        }
    });
    router.push('/admin'); // Redirect to main admin to force a new login
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar onLogout={handleLogout} />
      </div>

       {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-3 left-3 z-50 md:hidden bg-background/50 backdrop-blur-sm"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
           <Sidebar isMobile onLinkClick={() => setIsMobileMenuOpen(false)} onLogout={handleLogout} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-col flex-1 md:ml-16">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6 sticky top-0 z-30">
          <div className="w-full flex-1">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products, orders, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
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
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
