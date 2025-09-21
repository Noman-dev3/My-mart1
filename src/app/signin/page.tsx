'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { signInUser, signInWithGoogle } from '@/lib/auth-actions'; // Assuming you have a signInUser action
import { Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Schema for login validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'), // A simple check that password is not empty
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Reusable Icon Components from the previous example
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.242,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);
const AppleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.339 12.095c0 1.939-1.012 3.65-2.657 4.549-.872.483-1.896.79-2.906.79-.364 0-.74-.042-1.11-.123-.907-.206-1.89-.603-2.888-.603-.996 0-1.93.385-2.825.59-.395.09-.757.133-1.121.133-1.055 0-2.11-.33-2.997-.833-.94-.53-1.87-1.35-2.45-2.522-.057-.112-1.252-2.38-1.252-4.522 0-2.65 1.45-4.442 3.44-4.442 1.01 0 1.944.526 2.657.526.69 0 1.763-.532 2.877-.532 1.22 0 2.11.513 2.76.513.67 0 1.643-.513 2.812-.513 1.928 0 3.39 1.78 3.39 4.418zm-6.126-6.42c.114-1.238.93-2.28 1.986-2.907-1.12-.663-2.44-.755-3.32-.23-1.16.684-1.956 1.99-2.07 3.228.98.243 2.13.04 3.404-.09z"/>
    </svg>
);


export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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
    try {
      // Use your actual sign-in function here
      const result = await signInUser(values); 
      if (result.success) {
        toast({ title: 'Login Successful!', description: 'Welcome back.' });
        router.push('/dashboard'); // Redirect to a protected page
      } else {
        toast({ title: 'Login Failed', description: result.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'An Error Occurred', description: 'Invalid credentials or server error.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (field: keyof LoginFormValues) => {
    const error = errors[field];
    return error ? <p className="text-xs text-red-500 mt-1">{String(error.message)}</p> : null;
  };

  return (
    <div className="flex w-full max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
      
      {/* Left Panel: Form */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col bg-gradient-to-br from-white via-white to-yellow-50">
        <div className="flex-grow">
          <h1 className="font-bold text-2xl text-gray-800">Crestflo</h1>
          
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
            <p className="text-sm text-gray-500">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full mt-2 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              {getErrorMessage('email')}
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-600">Password</label>
                <Link href="/forgot-password" className="text-xs font-medium text-yellow-500 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <input
                {...register('password')}
                type='password'
                placeholder="••••••••"
                className="w-full mt-2 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              {getErrorMessage('password')}
            </div>
            
            <div className="pt-2">
              <Button type="submit" disabled={isLoading} className="w-full py-3 h-auto font-semibold text-center text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50">
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-6 grid grid-cols-2 gap-4">
             <button className="w-full py-3 font-semibold text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2" disabled>
              <AppleIcon />
              Apple
            </button>
            <button className="w-full py-3 font-semibold text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2" onClick={signInWithGoogle} disabled={isLoading}>
              <GoogleIcon />
              Google
            </button>
          </div>
        </div>

        <div className="mt-8 text-xs text-gray-400 flex justify-between items-center">
            <p>Don't have an account? <Link href="/signup" className="font-semibold text-gray-600 hover:underline">Sign up</Link></p>
            <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
        </div>
      </div>

      {/* Right Panel: Image */}
      <div className="relative hidden lg:block lg:w-1/2">
        <button className="absolute top-4 right-4 text-white bg-black/30 rounded-full p-2 hover:bg-black/50 transition-colors z-10">
          <X className="w-5 h-5" />
        </button>
        <Image
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
          alt="Team collaboration"
          layout="fill"
          className="object-cover"
        />
      </div>
    </div>
  );
}