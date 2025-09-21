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
    <div className="relative flex min-h-screen items-center justify-center bg-[#F4FBF7] p-4 overflow-hidden">
        <Image src="https://picsum.photos/seed/shape1/200/200" alt="shape" width={200} height={200} className="absolute -top-10 -left-10 opacity-50" />
        <Image src="https://picsum.photos/seed/shape2/150/150" alt="shape" width={150} height={150} className="absolute bottom-20 -right-10 opacity-50" />
        <Image src="https://picsum.photos/seed/shape3/100/100" alt="shape" width={100} height={100} className="absolute top-20 right-40 opacity-40" />
        <main className="relative z-10 flex items-center justify-center w-full">
            {children}
        </main>
    </div>
  );
}
