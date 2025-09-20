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

  const handleLoginSubmit = async (values) => {
    setIsLoading(true);
    const result = await signInUser(values);
    if (result && result.error) {
      toast({
        title: 'Login Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
    // On success, the server action handles the redirect.
    setIsLoading(false);
  };

  const handleSignupSubmit = async (values) => {
    setIsLoading(true);
    const result = await registerUser({ name: values.fullName, email: values.email, password: values.password });
    if (result.success) {
      toast({
        title: 'Account Created!',
        description: 'Please check your email to verify your account.',
      });
      setIsSignUp(false); // Switch to login view
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

  const handleModeChange = (mode) => {
    setIsSignUp(mode === 'signup');
    loginForm.reset();
    signupForm.reset();
  };
  
  const form = isSignUp ? signupForm : loginForm;
  const onSubmit = isSignUp ? handleSignupSubmit : handleLoginSubmit;

  return (
    <div className="flex items-center justify-center min-h-screen p-4 font-sans bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-sm p-8 bg-gradient-to-br from-[#FDFCEE] to-[#FAF3D1] dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-lg relative flex flex-col items-center text-center">
        {/* Close Button */}
        <Link href="/" passHref>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                <X className="h-6 w-6" />
            </button>
        </Link>
        
        {/* Logo and App Name */}
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </div>
          <span className="font-bold text-lg text-gray-800 dark:text-gray-200">My Mart</span>
        </div>

        <div className="mt-16 w-full">
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-100">
            {isSignUp ? 'Create an account' : 'Welcome back!'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {isSignUp ? 'Sign up and get started!' : 'Sign in to your account'}
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isSignUp && (
              <div>
                <input
                  type="text"
                  placeholder="Full name"
                  {...form.register('fullName')}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                 {form.formState.errors.fullName && <p className="text-red-500 text-xs text-left mt-1">{form.formState.errors.fullName.message}</p>}
              </div>
            )}
            <div>
              <input
                type="email"
                placeholder="Email"
                 {...form.register('email')}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
               {form.formState.errors.email && <p className="text-red-500 text-xs text-left mt-1">{form.formState.errors.email.message}</p>}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                 {...form.register('password')}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400"
              >
                {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
              </button>
            </div>
             {form.formState.errors.password && <p className="text-red-500 text-xs text-left -mt-4">{form.formState.errors.password.message}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-4 rounded-xl text-black font-bold bg-gradient-to-r from-yellow-300 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin mx-auto"/> : 'Submit'}
            </button>
          </form>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300 dark:border-gray-600" />
            <span className="mx-4 text-gray-500 dark:text-gray-400">or</span>
            <hr className="flex-grow border-gray-300 dark:border-gray-600" />
          </div>

          <div className="flex flex-col space-y-4">
            <button onClick={handleGoogleSignIn} disabled={isLoading} className="flex items-center justify-center p-3 border border-gray-300 dark:border-gray-600 rounded-xl space-x-2 bg-white dark:bg-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 488 512">
                 <path fill="#4285F4" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 265.8 0 129.5 109.8 20 244 20c74.8 0 134.3 29.3 179.6 71.9l-65.4 64.2c-28.5-27.1-65.4-46.3-114.2-46.3-86.4 0-157.1 70.3-157.1 156.6 0 86.3 70.7 156.6 157.1 156.6 99.9 0 138.2-79.5 142.7-116.7H244V261.8h244z"></path>
                 <path fill="#34A853" d="M12 24c3.24 0 5.92-1.07 7.89-2.91L16.94 17.75c-1.02.73-2.37 1.15-3.89 1.15-2.94 0-5.46-1.98-6.37-4.66H1.53v3.46A11.96 11.96 0 0012 24z"></path>
                 <path fill="#FBBC05" d="M5.63 15.65c-.24-.73-.38-1.5-.38-2.3s.14-1.57.38-2.3V7.59H2.06c-.66 1.3-1.04 2.77-1.04 4.41s.38 3.1 1.04 4.41l3.57-2.35z"></path>
                 <path fill="#EA4335" d="M12 4.44c1.79 0 3.4.63 4.67 1.83l2.67-2.67C17.92 1.94 15.24 1 12 1 8.76 1 6.08 1.94 4.09 3.59L7.66 6.05c.91-2.68 3.43-4.66 6.37-4.66z"></path>
              </svg>
              <span>Continue with Google</span>
            </button>
            <button disabled className="flex items-center justify-center p-3 border border-gray-300 dark:border-gray-600 rounded-xl space-x-2 bg-white dark:bg-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors opacity-50 cursor-not-allowed">
                <svg className="h-6 w-6 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.01,1.99C9.13,1.98,6.88,3.77,6,6.38c1.33-1.1,2.98-1.63,4.86-1.63c1.7,0,3.22,0.44,4.52,1.31 c-0.12-1.08-0.54-2.09-1.2-2.93C13.52,2.4,12.79,1.99,12.01,1.99z M20.9,13.21c0-0.03,0.01-0.06,0.01-0.09 c0-0.89-0.19-1.74-0.52-2.52c-0.83-1.92-2.4-3.5-4.32-4.34c-0.65-0.29-1.34-0.52-2.06-0.68c-1.42-0.32-2.88-0.32-4.31,0 c-0.72,0.16-1.41,0.39-2.06,0.68c-1.93,0.84-3.5,2.42-4.32,4.34C3.02,11.38,2.83,12.23,2.83,13.12c0,0.03,0,0.06,0.01,0.09 c-1.2,0.88-1.95,2.22-1.95,3.71c0,2.6,2.1,4.7,4.7,4.7c0.88,0,1.7-0.25,2.41-0.69c0.77,1.04,1.86,1.8,3.12,2.2 c1.4,0.45,2.88,0.45,4.28,0c1.26-0.4,2.35-1.16,3.12-2.2c0.71,0.44,1.53,0.69,2.41,0.69c2.6,0,4.7-2.1,4.7-4.7 C22.85,15.43,22.1,14.09,20.9,13.21z"></path></svg>
              <span>Continue with Apple</span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm w-full">
            <p className="text-gray-500 dark:text-gray-400">
              {isSignUp ? (
                <>Have an account? <button type="button" onClick={() => handleModeChange('login')} className="font-semibold text-gray-700 dark:text-gray-200 hover:underline focus:outline-none">Sign in</button></>
              ) : (
                <>Don't have an account? <button type="button" onClick={() => handleModeChange('signup')} className="font-semibold text-gray-700 dark:text-gray-200 hover:underline focus:outline-none">Sign up</button></>
              )}
            </p>
        </div>
      </div>
    </div>
  );
}
