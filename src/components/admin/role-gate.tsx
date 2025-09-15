'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { verifyRolePassword, type AdminRole } from '@/lib/role-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Icons } from '../icons';

type RoleGateProps = {
  role: AdminRole;
  children: React.ReactNode;
};

const panelVariants = {
  hidden: (i: number) => ({
    y: i % 2 === 0 ? '-100vh' : '100vh',
    opacity: 0
  }),
  visible: {
    y: '0vh',
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: (i: number) => ({
    y: i % 2 === 0 ? '100vh' : '-100vh',
    opacity: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.5
    }
  })
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.8,
      duration: 0.6
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};


export default function RoleGate({ role, children }: RoleGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const sessionKey = `myMart-role-${role}`;
    if (sessionStorage.getItem(sessionKey) === 'true') {
      setIsAuthenticated(true);
      setShowSuccess(false); // Don't show animation on reload
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
        setIsAuthenticated(true);
      }, 2000); // Duration of the success animation
    } else {
      setError('Incorrect password. Please try again.');
    }
    setIsLoading(false);
  };
  
  const roleName = role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (isAuthenticated) {
    return <>{children}</>;
  }
  
  if (showSuccess) {
      return (
          <div className="relative w-full h-full min-h-[80vh] flex items-center justify-center overflow-hidden">
               <AnimatePresence>
                 {showSuccess && (
                     <>
                        {[...Array(5)].map((_, i) => (
                           <motion.div
                             key={i}
                             custom={i}
                             variants={panelVariants}
                             initial="hidden"
                             animate="visible"
                             exit="exit"
                             className="w-[20vw] h-full bg-card"
                           />
                        ))}
                        <motion.div
                           variants={textVariants}
                           initial="hidden"
                           animate="visible"
                           exit="exit"
                           className="absolute z-10 text-center"
                        >
                            <h2 className="text-4xl font-headline font-bold">Access Granted</h2>
                            <p className="text-muted-foreground mt-2">Logged in as {roleName}</p>
                        </motion.div>
                     </>
                 )}
                </AnimatePresence>
          </div>
      )
  }

  return (
    <div className="flex h-screen w-full items-center justify-center p-4 bg-muted/30">
        <div className="relative w-full max-w-4xl min-h-[600px] grid lg:grid-cols-2 shadow-2xl overflow-hidden rounded-2xl bg-card">
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
        </div>
    </div>
  );
}