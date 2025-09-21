'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { signInUser, signInWithGoogle } from '@/lib/auth-actions';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.242,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);
const AppleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C9.656 0 7.817.918 6.68 2.375c-1.137 1.458-1.32 3.666-.375 5.75-.956.478-2.022.717-3.2.717C1.925 8.842.859 8.602 0 8.125c.945-2.084.762-4.292-.375-5.75C.817.918 2.656 0 5 0h7zm0 24c2.344 0 4.183-.918 5.32-2.375 1.137-1.458 1.32-3.666.375-5.75.956-.478 2.022.717 3.2-.717 1.178 0 2.244.24 3.2.717-.945 2.084-.762 4.292.375 5.75C22.817 23.082 20.978 24 18.634 24H12z"/>
    </svg>
);


export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    const result = await signInUser(values);

    if (result && result.error) {
      toast({
        title: 'Login Failed',
        description: result.error,
        variant: 'destructive',
      });
      setIsLoading(false);
    } else {
      toast({
        title: 'Login Successful!',
        description: 'Welcome back.',
      });
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    // The page will redirect, so we don't need to setIsLoading(false)
  };

  const getErrorMessage = (field: keyof LoginFormValues) => {
    const error = errors[field];
    return error ? <p className="text-xs text-red-500 mt-1">{String(error.message)}</p> : null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-gray-800 rounded-2xl shadow-2xl flex overflow-hidden">
      
      {/* Left Panel: Image */}
      <div className="relative hidden lg:block lg:w-1/2">
        <Image
          src="https://picsum.photos/seed/desert-night/800/1200"
          alt="Desert Night"
          layout="fill"
          className="object-cover"
          data-ai-hint="desert night"
        />
        <div className="absolute inset-0 bg-black/30 p-8 text-white flex flex-col">
            <div className="flex justify-between items-start">
                <p className="font-bold text-xl">AMU</p>
                <Link href="/" className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition-opacity">
                    <ArrowLeft className="h-4 w-4" />
                    Back to website
                </Link>
            </div>
            <div className="mt-auto text-center">
                <h2 className="text-3xl font-bold">Welcome Back</h2>
                <p className="mt-2 text-sm max-w-sm mx-auto opacity-90">Sign in to continue your journey with us. Access your account, orders, and more.</p>
                <div className="flex justify-center gap-2 mt-4">
                    <span className="h-2 w-8 rounded-full bg-white"></span>
                    <span className="h-2 w-2 rounded-full bg-white/50"></span>
                    <span className="h-2 w-2 rounded-full bg-white/50"></span>
                </div>
            </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
        <p className="text-gray-400 mb-8">Enter your credentials to access your account.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
            <input
                {...register('email')}
                type="email"
                placeholder="Email"
                className="auth-input"
            />
            {getErrorMessage('email')}
            </div>

            <div>
            <input
                {...register('password')}
                type='password'
                placeholder="Password"
                className="auth-input"
            />
            {getErrorMessage('password')}
            </div>
            
            <div className="pt-2">
            <Button
                type="submit"
                disabled={isLoading}
                className="auth-button-primary"
            >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Sign In
            </Button>
            </div>
        </form>

        <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-600" />
            <span className="mx-4 text-sm text-gray-500">OR</span>
            <hr className="flex-grow border-gray-600" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="auth-button-secondary" onClick={handleGoogleSignIn} disabled={isLoading}>
                <GoogleIcon />
                Google
            </button>
            <button className="auth-button-secondary" disabled>
                <AppleIcon/>
                Apple
            </button>
        </div>

         <p className="text-sm text-gray-400 mt-8 text-center">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-indigo-400 hover:underline">
                Sign Up
            </Link>
        </p>

      </div>
    </div>
  );
}
