
'use client';

import { useState, useEffect, Suspense, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { verifyUserRole, type AdminRole } from '@/lib/role-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Bell, Menu, Unlock, Package, Settings, BarChart2, Users, FileText } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Sidebar from '@/components/admin/sidebar';
import { Icons } from '../icons';
import Image from 'next/image';


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
    const checkAuth = () => {
      const sessionKey = `myMart-role-session`;
      try {
        const sessionValue = sessionStorage.getItem(sessionKey);
        if (sessionValue) {
          const { user, expiry } = JSON.parse(sessionValue);
          if (new Date().getTime() < expiry) {
            // SUPER_ADMIN can access everything.
            if (user.role === 'SUPER_ADMIN' || user.role === role) {
              setAuthStatus('authenticated');
              return;
            }
          }
        }
      } catch (e) {
        // Fallback for any parsing errors
      }
      setAuthStatus('unauthenticated');
    };
    checkAuth();
  }, [role, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await verifyUserRole(username, password);

    if (result.success && (result.role === 'SUPER_ADMIN' || result.role === role)) {
        const expiry = new Date().getTime() + 60 * 60 * 1000; // 1 hour session
        const sessionValue = JSON.stringify({ user: { username, role: result.role }, expiry });
        sessionStorage.setItem(`myMart-role-session`, sessionValue);

        setShowSuccess(true);
        setTimeout(() => {
          setAuthStatus('authenticated');
          setShowSuccess(false);
        }, 1500);
    } else {
      setError(result.error || 'Incorrect credentials or insufficient permissions.');
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
        <div className="relative flex h-screen w-full items-center justify-center bg-gray-900 p-4">
             <Image
                src="https://picsum.photos/seed/admin-bg-full/1920/1080"
                alt="Admin background"
                layout="fill"
                objectFit="cover"
                quality={90}
                className="opacity-40"
                data-ai-hint="abstract texture"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 to-black/80"></div>
            
            <AnimatePresence mode="wait">
                {showSuccess ? (
                    <SuccessAnimation roleName={roleName} />
                ) : (
                   <div className="relative w-full h-full flex items-center justify-center">

                        {/* Mobile View */}
                        <div className="relative w-full max-w-md p-8 space-y-6 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl md:hidden">
                           <LoginHeader isGlass />
                            <div className="text-left">
                                <h1 className="font-headline text-3xl font-bold text-white">Admin Access</h1>
                                <p className="text-gray-300 mt-1 text-sm">Requires <span className="font-semibold text-white">{roleName}</span> role.</p>
                            </div>
                            <LoginForm
                                username={username} setUsername={setUsername}
                                password={password} setPassword={setPassword}
                                isLoading={isLoading} error={error} handleLogin={handleLogin}
                                isGlass
                            />
                        </div>

                        {/* Tablet and Desktop View */}
                        <div className="hidden md:grid max-w-6xl w-full h-auto max-h-[700px] shadow-2xl overflow-hidden rounded-2xl md:grid-cols-2">
                             <div className="p-10 flex flex-col justify-center bg-black/30 backdrop-blur-xl border border-white/10 lg:bg-card lg:backdrop-blur-none lg:border-none">
                                <LoginHeader />
                                <div className="text-left mb-8">
                                    <h1 className="font-headline text-4xl font-bold text-foreground">Admin Access</h1>
                                    <p className="text-muted-foreground mt-2">Login to manage your store. Requires<br/>the <span className="font-semibold text-foreground">{roleName}</span> role.</p>
                                </div>
                                <LoginForm
                                    username={username} setUsername={setUsername}
                                    password={password} setPassword={setPassword}
                                    isLoading={isLoading} error={error} handleLogin={handleLogin}
                                />
                            </div>
                            
                            <div className="relative">
                                {/* Tablet View Right Side */}
                                <div className="hidden md:flex lg:hidden bg-black/20 backdrop-blur-xl border-l border-white/10 h-full p-10 flex-col justify-center">
                                    <h3 className="font-headline text-2xl font-bold mb-2 text-white">My Mart Dashboard</h3>
                                    <p className="text-gray-300 mb-8">All the tools you need to run your store efficiently.</p>
                                    <div className="space-y-6">
                                        <FeatureItem icon={BarChart2} title="Sales Analytics" description="Monitor revenue, track orders, and gain insights into store performance." />
                                        <FeatureItem icon={Package} title="Inventory Control" description="Add, edit, and manage all products, including stock levels and pricing." />
                                        <FeatureItem icon={Users} title="Customer Management" description="View customer history and manage user data." />
                                        <FeatureItem icon={FileText} title="Content Editing" description="Easily update your site's content, theme, and operational settings." />
                                    </div>
                                </div>
                                
                                {/* Desktop View Right Side */}
                                <div className="hidden lg:block h-full w-full relative">
                                    <Image
                                        src="https://picsum.photos/seed/admin-bg-side/800/1200"
                                        alt="Admin decorative"
                                        layout="fill"
                                        objectFit="cover"
                                        quality={90}
                                        data-ai-hint="abstract modern"
                                    />
                                </div>
                            </div>
                        </div>

                   </div>
                )}
            </AnimatePresence>
        </div>
      );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

// --- Reusable Login Header ---
const LoginHeader = ({ isGlass = false }: { isGlass?: boolean }) => (
    <Link href="/" className={`w-fit mb-8 flex items-center gap-2 transition-colors ${isGlass ? 'text-white/80 hover:text-white' : 'text-muted-foreground hover:text-primary'}`}>
        <Icons.logo className="h-6 w-6"/>
        <span className="font-headline text-xl font-semibold">My Mart</span>
    </Link>
)

// --- Reusable Feature Item for Tablet view ---
const FeatureItem = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white"/>
        </div>
        <div>
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-sm text-gray-300">{description}</p>
        </div>
    </div>
);


// --- Login Form Component ---

function LoginForm({
    username, setUsername, password, setPassword, isLoading, error, handleLogin, isGlass = false
}: {
    username: string; setUsername: (u: string) => void;
    password: string; setPassword: (p: string) => void;
    isLoading: boolean; error: string;
    handleLogin: (e: React.FormEvent) => void;
    isGlass?: boolean;
}) {
    const isGlassEffective = isGlass || false; // default to false
    return (
        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <Label htmlFor="username" className={isGlassEffective ? 'text-gray-200' : 'text-foreground'}>Username</Label>
                <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    className={`mt-1 h-11 ${isGlassEffective ? 'bg-white/10 text-white placeholder:text-gray-400 border-white/20 focus:bg-white/20' : 'bg-background'}`}
                />
            </div>
            <div>
                <Label htmlFor="password" className={isGlassEffective ? 'text-gray-200' : 'text-foreground'}>Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className={`mt-1 h-11 ${isGlassEffective ? 'bg-white/10 text-white placeholder:text-gray-400 border-white/20 focus:bg-white/20' : 'bg-background'}`}
                />
                {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            </div>
            <Button type="submit" size="lg" className="w-full font-bold h-11" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Unlock className="mr-2 h-4 w-4"/>}
            Authenticate
            </Button>
        </form>
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
            key="success"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-center p-8 bg-card rounded-lg shadow-2xl relative z-10"
        >
            <h2 className="text-4xl font-headline font-bold text-primary">Access Granted</h2>
            <p className="text-muted-foreground mt-2">Welcome! You have access as {roleName}.</p>
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
