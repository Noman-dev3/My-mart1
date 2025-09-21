
'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  uid: string | null;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  uid: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // This is the key change: force a refresh on auth state changes
        // to ensure server components re-render with the new session.
        if (event === 'SIGNED_IN' && pathname.startsWith('/login')) {
          router.push('/');
        } else if (event === 'SIGNED_OUT') {
           router.push('/');
        } else {
           router.refresh();
        }
      }
    );

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth, pathname]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    uid: user?.id ?? null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
