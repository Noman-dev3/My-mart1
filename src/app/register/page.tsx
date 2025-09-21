'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { registerUser, signInWithGoogle } from '@/lib/auth-actions';
import { Loader2, ArrowRight } from 'lucide-react';

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      agreeTerms: false,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      const result = await registerUser({
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        password: values.password,
      });
      if (result.success) {
        toast({
          title: 'Account Created!',
          description: 'Please check your email to verify your account.',
        });
        // Optionally redirect to signin page
        // router.push('/signin');
      } else {
        toast({
          title: 'Registration Failed',
          description: result.error,
          variant: 'destructive',
        });
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
    setIsLoading(false);
  };

  const getErrorMessage = (field: keyof SignupFormValues) => {
    const error = errors[field];
    return error ? <p className="text-xs text-red-500 mt-1">{String(error.message)}</p> : null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-[#2C2C2C] shadow-2xl rounded-2xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* Left Panel: Image */}
      <div className="relative hidden lg:block">
        <Image
          src="https://picsum.photos/seed/desert-night/800/1000"
          alt="Desert at night"
          width={800}
          height={1000}
          className="object-cover w-full h-full"
          data-ai-hint="desert dune"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-8 flex flex-col">
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-2xl tracking-[0.2em] text-white">AMU</h1>
            <Link href="/" className="text-white text-sm py-2 px-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2">
              Back to website <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-auto text-center text-white">
            <h2 className="text-3xl font-medium">Capturing Moments,</h2>
            <h2 className="text-3xl font-medium">Creating Memories</h2>
            <div className="flex justify-center gap-2 mt-4">
              <div className="w-3 h-1.5 bg-white/30 rounded-full"></div>
              <div className="w-3 h-1.5 bg-white/30 rounded-full"></div>
              <div className="w-6 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="p-8 sm:p-12 text-white">
        <h2 className="text-4xl font-bold mb-2">Create an account</h2>
        <p className="text-sm text-gray-400 mb-8">
          Already have an account? <Link href="/signin" className="font-semibold text-white hover:underline">Log in</Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <input
                {...register('firstName')}
                type="text"
                placeholder="First name"
                className="auth-input"
              />
              {getErrorMessage('firstName')}
            </div>
            <div>
              <input
                {...register('lastName')}
                type="text"
                placeholder="Last name"
                className="auth-input"
              />
              {getErrorMessage('lastName')}
            </div>
          </div>

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
              placeholder="Enter your password"
              className="auth-input"
            />
            {getErrorMessage('password')}
          </div>

          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                {...register('agreeTerms')}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-500 bg-transparent text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-400">
                I agree to the <Link href="/terms-of-service" className="text-white hover:underline">Terms & Conditions</Link>
              </span>
            </label>
            {getErrorMessage('agreeTerms')}
          </div>
          
          <div className="pt-2">
            <Button type="submit" disabled={isLoading} className="auth-button-primary">
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Create account
            </Button>
          </div>
        </form>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-600" />
          <span className="mx-4 text-sm text-gray-400">Or register with</span>
          <hr className="flex-grow border-gray-600" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button className="auth-button-secondary" onClick={handleGoogleSignIn} disabled={isLoading}>
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.242,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            Google
          </button>
          <button className="auth-button-secondary" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C9.656 0 7.817.918 6.68 2.375c-1.137 1.458-1.32 3.666-.375 5.75-.956.478-2.022.717-3.2.717C1.925 8.842.859 8.602 0 8.125c.945-2.084.762-4.292-.375-5.75C.817.918 2.656 0 5 0h7zm0 24c2.344 0 4.183-.918 5.32-2.375 1.137-1.458 1.32-3.666.375-5.75.956-.478 2.022.717 3.2-.717 1.178 0 2.244.24 3.2.717-.945 2.084-.762 4.292.375 5.75C22.817 23.082 20.978 24 18.634 24H12z"/></svg>
            Apple
          </button>
        </div>
      </div>
    </div>
  );
}
