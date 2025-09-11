
'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { signOut as firebaseSignOut } from "firebase/auth";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
        await firebaseSignOut(auth);
        toast({
            title: "Signed Out",
            description: "You have been successfully signed out.",
        });
        router.push('/');
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to sign out.",
            variant: "destructive",
        });
    }
  }

  const value = { user, loading, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
