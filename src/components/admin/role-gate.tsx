
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyRolePassword, type AdminRole } from '@/lib/role-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className="w-full h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <Icons.logo className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Enter Password</CardTitle>
          <CardDescription>
            Enter the password for the <span className="font-bold text-foreground">{roleName}</span> role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 animate-spin" /> : null}
              Unlock
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
