
'use client';

import { useState, useEffect, Suspense, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { verifyUserRole, type AdminRole } from '@/lib/role-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Bell, Menu, Unlock } from 'lucide-react';
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const sessionKey = `myMart-role-session`; // Unified session key
    try {
      const sessionValue = sessionStorage.getItem(sessionKey);
      if (sessionValue) {
        const { user, expiry } = JSON.parse(sessionValue);
        if (new Date().getTime() < expiry) {
            // Re-verify the role on page load in case permissions change
            if (user.role === 'SUPER_ADMIN' || user.role === role) {
               setAuthStatus('authenticated');
            } else {
               // User has a session but not for this role, redirect to main admin login
               router.push('/admin');
            }
        } else {
            // Session expired
            sessionStorage.removeItem(sessionKey);
            router.push('/admin');
        }
      } else {
        setAuthStatus('unauthenticated');
      }
    } catch (e) {
      setAuthStatus('unauthenticated');
    }
  }, [role, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await verifyUserRole(role, username, password);

    if (result.success) {
      // Create a session that lasts for 1 hour
      const expiry = new Date().getTime() + 60 * 60 * 1000;
      const sessionValue = JSON.stringify({ user: { username, role: result.role }, expiry });
      sessionStorage.setItem(`myMart-role-session`, sessionValue);

      setShowSuccess(true);
      setTimeout(() => {
        setAuthStatus('authenticated');
        setShowSuccess(false);
      }, 1500);
    } else {
      setError(result.error || 'Incorrect username or password, or insufficient permissions.');
      setIsLoading(false);
    }
  };
  
  const roleName = role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (authStatus === 'checking') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authStatus === 'authenticated') {
    return <AdminLayoutContent>{children}</AdminLayoutContent>;
  }
  
  if (authStatus === 'unauthenticated') {
     return (
        <div className="flex h-screen w-full items-center justify-center p-4 bg-gray-900 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-10 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-blue-500/20 animate-gradient-xy"></div>
            
            <AnimatePresence>
                {showSuccess ? (
                    <SuccessAnimation roleName={roleName} />
                ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="relative z-10 w-full max-w-md"
                    >
                        <div className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl shadow-primary/10">
                            <div className="text-center">
                                <Link href="/" className="inline-block mb-6">
                                    <Icons.logo className="h-10 w-10 text-primary"/>
                                </Link>

                                <h1 className="font-headline text-4xl font-bold">Admin Access</h1>
                                <p className="text-white/60 mt-2">Access to this section requires the <br/><span className="font-semibold text-white">{roleName}</span> role.</p>
                            </div>

                            <form onSubmit={handleLogin} className="mt-8 space-y-4">
                                <div>
                                    <Label htmlFor="username" className="text-white/60">Username</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        disabled={isLoading}
                                        className="mt-1 bg-white/5 border-white/20 placeholder:text-white/30 h-11"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                        className="mt-1 bg-white/5 border-white/20 placeholder:text-white/30 h-11"
                                    />
                                    {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
                                </div>
                                <Button type="submit" size="lg" className="w-full font-bold h-11" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Unlock className="mr-2 h-4 w-4"/>}
                                 Authenticate
                                </Button>
                            </form>
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
            className="absolute z-10 text-center p-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10"
        >
            <h2 className="text-4xl font-headline font-bold text-primary">Access Granted</h2>
            <p className="text-white/70 mt-2">Welcome! You have access as {roleName}.</p>
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
    // Clear the unified role session
    sessionStorage.removeItem('myMart-role-session');
    router.push('/admin'); // Redirect to main admin to force a new login
    // Force a full page reload to ensure all state is cleared
    window.location.reload();
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
