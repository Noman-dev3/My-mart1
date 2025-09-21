
'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and we have a user, redirect them away.
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  // While loading, or if the user is found (and we are about to redirect), show a loading screen.
  // This prevents the login form from ever flashing on the screen for a logged-in user.
  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Only render the children (the login page) if loading is complete AND there is no user.
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      {children}
    </div>
  );
}
