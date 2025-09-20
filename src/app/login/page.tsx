'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { registerUser, signInUser, signInWithGoogle } from '@/lib/auth-actions';
import { Loader2 } from 'lucide-react';

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignupFormValues = z.infer<typeof signupSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthenticationPage() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const currentSchema = isSignUp ? signupSchema : loginSchema;

  const form = useForm<SignupFormValues | LoginFormValues>({
    resolver: zodResolver(currentSchema),
    defaultValues: isSignUp
      ? { firstName: '', lastName: '', email: '', password: '', agreeTerms: false }
      : { email: '', password: '' },
  });
  
  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (values: SignupFormValues | LoginFormValues) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        const signupValues = values as SignupFormValues;
        const result = await registerUser({
          name: `${signupValues.firstName} ${signupValues.lastName}`,
          email: signupValues.email,
          password: signupValues.password,
        });
        if (result.success) {
          toast({
            title: 'Account Created!',
            description: 'Please check your email to verify your account.',
          });
          setIsSignUp(false);
          form.reset({ email: signupValues.email, password: '' });
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
        // On success, server action redirects, no client-side redirect needed.
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
    // setIsLoading will remain true as the page redirects.
  };

  const getErrorMessage = (field: keyof (SignupFormValues & LoginFormValues)) => {
    const error = errors[field as keyof typeof errors];
    return error ? <p className="text-xs text-red-400 mt-1">{String(error.message)}</p> : null;
  };


  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-white">
        {isSignUp ? 'Create an account' : 'Sign in to your account'}
      </h1>
      <p className="mt-2 text-sm text-gray-400">
        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
        <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-indigo-400 hover:text-indigo-300">
          {isSignUp ? 'Log in' : 'Create an account'}
        </button>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        {isSignUp && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                {...register('firstName')}
                type="text"
                placeholder="First name"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
               {getErrorMessage('firstName')}
            </div>
            <div>
              <input
                {...register('lastName')}
                type="text"
                placeholder="Last name"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {getErrorMessage('lastName')}
            </div>
          </div>
        )}

        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="Email"
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
           {getErrorMessage('email')}
        </div>

        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {getErrorMessage('password')}


        {isSignUp && (
          <div>
            <label className="flex items-center space-x-3">
              <input
                {...register('agreeTerms')}
                type="checkbox"
                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-400">
                I agree to the <Link href="/terms-of-service" className="text-indigo-400 hover:underline">Terms & Conditions</Link>
              </span>
            </label>
            {getErrorMessage('agreeTerms')}
          </div>
        )}

        <div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 h-auto text-base"
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isSignUp ? 'Create account' : 'Sign In'}
          </Button>
        </div>
      </form>

      <div className="flex items-center my-6">
        <hr className="flex-grow border-gray-600" />
        <span className="mx-4 text-sm text-gray-400">Or register with</span>
        <hr className="flex-grow border-gray-600" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="bg-gray-700/50 border-gray-600 hover:bg-gray-700 h-auto py-3" onClick={handleGoogleSignIn} disabled={isLoading}>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.242,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            Google
        </Button>
        <Button variant="outline" className="bg-gray-700/50 border-gray-600 hover:bg-gray-700 h-auto py-3" disabled>
             <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
               <path d="M17.74,13.153a4.077,4.077,0,0,1,1.554-3.111,4.246,4.246,0,0,0-3.376-2.039,4.08,4.08,0,0,0-3.918,4.083A4.01,4.01,0,0,0,15.918,16a3.64,3.64,0,0,0,1.822-.5ZM12,6.187A4.666,4.666,0,0,1,8.1,7.6,4.8,4.8,0,0,1,6.26,6.2,5.015,5.015,0,0,1,12,1,5.015,5.015,0,0,1,17.74,6.2a4.8,4.8,0,0,1-1.839,1.4A4.666,4.666,0,0,1,12,6.187Z"></path>
            </svg>
            Apple
        </Button>
      </div>
    </div>
  );
}
