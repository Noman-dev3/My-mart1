'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { registerUser, signInUser, signInWithGoogle } from '@/lib/auth-actions';
import { Loader2 } from 'lucide-react';
import { Icons } from '@/components/icons';

const signupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignupFormValues = z.infer<typeof signupSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthenticationPage() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const currentSchema = isSignUp ? signupSchema : loginSchema;
  
  const form = useForm<SignupFormValues | LoginFormValues>({
    resolver: zodResolver(currentSchema),
    defaultValues: isSignUp
      ? { fullName: '', email: '', password: '' }
      : { email: '', password: '' },
  });
  
  const { register, handleSubmit, formState: { errors }, reset } = form;

  const handleModeChange = (newMode: 'login' | 'signup') => {
    setIsSignUp(newMode === 'signup');
    reset();
  };

  const onSubmit = async (values: SignupFormValues | LoginFormValues) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        const signupValues = values as SignupFormValues;
        const result = await registerUser({
          name: signupValues.fullName,
          email: signupValues.email,
          password: signupValues.password,
        });
        if (result.success) {
          toast({
            title: 'Account Created!',
            description: 'Please check your email to verify your account.',
          });
          handleModeChange('login');
        } else {
          toast({
            title: 'Registration Failed',
            description: result.error,
            variant: 'destructive',
          });
        }
      } else {
        const loginValues = values as LoginFormValues;
        const result = await signInUser(loginValues);
        if (result && result.error) {
          toast({
            title: 'Login Failed',
            description: result.error,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'An Error Occurred',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signInWithGoogle();
  };
  
  const getErrorMessage = (field: keyof (SignupFormValues & LoginFormValues)) => {
    const error = errors[field as keyof typeof errors];
    return error ? <p className="text-xs text-red-500 mt-1">{String(error.message)}</p> : null;
  };

  return (
    <div className="w-full bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Side: Form */}
            <div className="p-8 sm:p-12 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-10">
                        <Icons.logo className="h-7 w-7 text-gray-800 dark:text-white" />
                        <span className="font-bold text-xl text-gray-800 dark:text-white">Crestflo</span>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {isSignUp ? 'Create an account' : 'Sign in'}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                         {isSignUp ? 'Sign up and get 30 day free trial' : 'Welcome back! Please sign in.'}
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                        {isSignUp && (
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
                                <input {...register('fullName')} type="text" placeholder="Amelie Laurent" className="auth-input-new mt-1"/>
                                {getErrorMessage('fullName')}
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input {...register('email')} type="email" placeholder="amelielaurent@gmail.com" className="auth-input-new mt-1"/>
                            {getErrorMessage('email')}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input {...register('password')} type="password" placeholder="••••••••" className="auth-input-new mt-1"/>
                            {getErrorMessage('password')}
                        </div>

                        <div className="pt-2 space-y-4">
                            <Button type="submit" disabled={isLoading} className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold text-base rounded-full shadow-md">
                                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                Submit
                            </Button>
                            <div className="flex items-center justify-center gap-4">
                                <button type="button" className="auth-social-button" disabled>
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                                </button>
                                <button type="button" onClick={handleGoogleSignIn} className="auth-social-button">
                                     <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.242,44,30.038,44,24c0,22.659-0.138,21.35-0.389,20.083z"></path></svg>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                     <p>
                        {isSignUp ? 'Have an account?' : "Don't have an account?"}{' '}
                        <button onClick={() => handleModeChange(isSignUp ? 'login' : 'signup')} className="font-semibold text-gray-800 dark:text-white hover:underline">
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                    <Link href="/terms-of-service" className="hover:underline">Terms & Conditions</Link>
                </div>
            </div>

            {/* Right Side: Image */}
            <div className="hidden md:block relative">
                <Image 
                    src="https://picsum.photos/seed/auth-meeting/800/1200"
                    alt="Team meeting"
                    fill
                    className="object-cover rounded-r-3xl"
                    data-ai-hint="team meeting office"
                />
            </div>
        </div>
    </div>
  );
}
