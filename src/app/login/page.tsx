'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerUser, signInUser, signInWithGoogle } from '@/lib/auth-actions';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export default function UnifiedAuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const handleLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    const result = await signInUser(values);
    if (result && result.error) {
      toast({
        title: 'Login Failed',
        description: result.error,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
    // On success, the server action handles the redirect.
  };

  const handleSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    const result = await registerUser({ name: values.fullName, email: values.email, password: values.password });
    if (result.success) {
      toast({
        title: 'Account Created!',
        description: 'Please check your email to verify your account.',
      });
      setIsSignUp(false); // Switch to login view
      signupForm.reset();
    } else {
      toast({
        title: 'Registration Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    // This will redirect, so no need to set isSubmitting to false
  };

  const handleModeChange = (mode: 'signup' | 'login') => {
    setIsSignUp(mode === 'signup');
    loginForm.reset();
    signupForm.reset();
  };
  
  const form = isSignUp ? signupForm : loginForm;
  const onSubmit = isSignUp ? handleSignupSubmit : handleLoginSubmit;

  return (
    <>
      <div className="w-fit mb-8">
        <Link href="/" passHref>
          <button className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors p-2 -ml-2 rounded-lg">
             <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
            </div>
            <span className="font-bold text-lg text-gray-800 dark:text-gray-200">Crextio</span>
          </button>
        </Link>
      </div>

      <div className="w-full">
        <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-100">
          {isSignUp ? 'Create an account' : 'Welcome back!'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {isSignUp ? 'Sign up and get a 30 day free trial' : 'Sign in to your account'}
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {isSignUp && (
            <div>
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
              <input
                type="text"
                placeholder="Amelie Laurent"
                {...form.register('fullName')}
                className="mt-1 w-full p-3 h-12 border-none bg-white dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-gray-400"
              />
               {form.formState.errors.fullName && <p className="text-red-500 text-xs text-left mt-1">{String(form.formState.errors.fullName.message)}</p>}
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              placeholder="amelielaurent@gmail.com"
               {...form.register('email')}
              className="mt-1 w-full p-3 h-12 border-none bg-white dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-gray-400"
            />
             {form.formState.errors.email && <p className="text-red-500 text-xs text-left mt-1">{String(form.formState.errors.email.message)}</p>}
          </div>
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
               {...form.register('password')}
              className="mt-1 w-full p-3 h-12 border-none bg-white dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute bottom-3 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500"
            >
              {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
            </button>
          </div>
           {form.formState.errors.password && <p className="text-red-500 text-xs text-left">{String(form.formState.errors.password.message)}</p>}
          
          <div className="flex items-center justify-between gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full p-4 h-14 text-base rounded-2xl text-black font-bold bg-gradient-to-b from-yellow-300 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-yellow-400/30"
              >
                {isLoading ? <Loader2 className="animate-spin mx-auto"/> : 'Submit'}
              </button>
              <button type="button" disabled={isLoading} className="flex items-center justify-center p-3 h-14 w-16 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <svg className="h-6 w-6 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.01,1.99C9.13,1.98,6.88,3.77,6,6.38c1.33-1.1,2.98-1.63,4.86-1.63c1.7,0,3.22,0.44,4.52,1.31 c-0.12-1.08-0.54-2.09-1.2-2.93C13.52,2.4,12.79,1.99,12.01,1.99z M20.9,13.21c0-0.03,0.01-0.06,0.01-0.09 c0-0.89-0.19-1.74-0.52-2.52c-0.83-1.92-2.4-3.5-4.32-4.34c-0.65-0.29-1.34-0.52-2.06-0.68c-1.42-0.32-2.88-0.32-4.31,0 c-0.72,0.16-1.41,0.39-2.06,0.68c-1.93,0.84-3.5,2.42-4.32,4.34C3.02,11.38,2.83,12.23,2.83,13.12c0,0.03,0,0.06,0.01,0.09 c-1.2,0.88-1.95,2.22-1.95,3.71c0,2.6,2.1,4.7,4.7,4.7c0.88,0,1.7-0.25,2.41-0.69c0.77,1.04,1.86,1.8,3.12,2.2 c1.4,0.45,2.88,0.45,4.28,0c1.26-0.4,2.35-1.16,3.12-2.2c0.71,0.44,1.53,0.69,2.41,0.69c2.6,0,4.7-2.1,4.7-4.7 C22.85,15.43,22.1,14.09,20.9,13.21z"></path></svg>
              </button>
               <button onClick={handleGoogleSignIn} disabled={isLoading} className="flex items-center justify-center p-3 h-14 w-16 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 488 512">
                     <path d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 265.8 0 129.5 109.8 20 244 20c74.8 0 134.3 29.3 179.6 71.9l-65.4 64.2c-28.5-27.1-65.4-46.3-114.2-46.3-86.4 0-157.1 70.3-157.1 156.6 0 86.3 70.7 156.6 157.1 156.6 99.9 0 138.2-79.5 142.7-116.7H244V261.8h244z"></path>
                  </svg>
              </button>
          </div>
        </form>
      </div>

      <div className="mt-auto pt-8 text-center text-xs w-full flex justify-between">
          <p className="text-gray-500 dark:text-gray-400">
            {isSignUp ? (
              <>Have an account? <button type="button" onClick={() => handleModeChange('login')} className="font-semibold text-gray-700 dark:text-gray-200 hover:underline focus:outline-none">Sign in</button></>
            ) : (
              <>Don't have an account? <button type="button" onClick={() => handleModeChange('signup')} className="font-semibold text-gray-700 dark:text-gray-200 hover:underline focus:outline-none">Sign up</button></>
            )}
          </p>
          <Link href="/terms-of-service" className="text-gray-500 dark:text-gray-400 font-semibold hover:underline">Terms & Conditions</Link>
      </div>
    </>
  );
}
