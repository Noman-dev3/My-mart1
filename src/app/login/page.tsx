'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { registerUser, signInUser, signInWithGoogle } from '@/lib/auth-actions';
import { Loader2, Eye, EyeOff } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const currentSchema = isSignUp ? signupSchema : loginSchema;
  
  const form = useForm<SignupFormValues | LoginFormValues>({
    resolver: zodResolver(currentSchema),
    defaultValues: isSignUp
      ? { firstName: '', lastName: '', email: '', password: '', agreeTerms: false }
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
          name: `${signupValues.firstName} ${signupValues.lastName}`,
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
    return error ? <p className="text-xs text-red-400 mt-1">{String(error.message)}</p> : null;
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {isSignUp ? 'Create an account' : 'Sign in to your account'}
        </h1>
        <p className="text-gray-400 text-sm">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button 
            onClick={() => handleModeChange(isSignUp ? 'login' : 'signup')} 
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            {isSignUp ? 'Log in' : 'Create an account'}
          </button>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1">
        {isSignUp && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                {...register('firstName')}
                type="text"
                placeholder="Fletcher"
                className="w-full h-12 bg-gray-700/50 border border-gray-600 rounded-lg px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {getErrorMessage('firstName')}
            </div>
            <div>
              <input
                {...register('lastName')}
                type="text"
                placeholder="Last name"
                className="w-full h-12 bg-gray-700/50 border border-gray-600 rounded-lg px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            className="w-full h-12 bg-gray-700/50 border border-gray-600 rounded-lg px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {getErrorMessage('email')}
        </div>

        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            className="w-full h-12 bg-gray-700/50 border border-gray-600 rounded-lg px-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {getErrorMessage('password')}
        </div>

        {isSignUp && (
          <div className="flex items-center space-x-3">
            <input
              {...register('agreeTerms')}
              type="checkbox"
              id="agreeTerms"
              className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-2"
            />
            <label htmlFor="agreeTerms" className="text-sm text-gray-300">
              I agree to the <Link href="/terms-of-service" className="text-purple-400 hover:text-purple-300">Terms & Conditions</Link>
            </label>
          </div>
        )}
        {isSignUp && getErrorMessage('agreeTerms')}
        
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {isSignUp ? 'Create account' : 'Sign In'}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-6">
        <hr className="flex-grow border-gray-600" />
        <span className="mx-4 text-xs text-gray-500 font-medium">OR CONTINUE WITH</span>
        <hr className="flex-grow border-gray-600" />
      </div>

      {/* Social buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={handleGoogleSignIn} 
          disabled={isLoading}
          className="h-12 flex items-center justify-center gap-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg text-white font-medium transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.242,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
          </svg>
          Google
        </button>
        <button 
          className="h-12 flex items-center justify-center gap-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg text-white font-medium transition-colors opacity-50 cursor-not-allowed"
          disabled
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Apple
        </button>
      </div>
    </div>
  );
}