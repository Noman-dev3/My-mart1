'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { registerUser, signInUser } from '@/lib/auth-actions';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const loginImages = [
    { src: "https://picsum.photos/seed/pancakes/600/400", alt: "Pancakes with strawberries", hint: "pancakes breakfast" },
    { src: "https://picsum.photos/seed/coffee/600/400", alt: "Artisan coffee", hint: "coffee shop" },
    { src: "https://picsum.photos/seed/croissant/600/400", alt: "Freshly baked croissant", hint: "bakery pastry" }
];

export default function AuthenticationPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
        setImageIndex(prev => (prev + 1) % loginImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, []);

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

  const getErrorMessage = (field: keyof (SignupFormValues & LoginFormValues)) => {
    const error = errors[field as keyof typeof errors];
    return error ? <p className="text-xs text-red-500 mt-1">{String(error.message)}</p> : null;
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-sm">
      <div className="relative h-56">
         <AnimatePresence>
            <motion.div
                key={imageIndex}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            >
                <Image 
                    src={loginImages[imageIndex].src}
                    alt={loginImages[imageIndex].alt}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                    data-ai-hint={loginImages[imageIndex].hint}
                    priority
                />
            </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-0 left-0 w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                <path fill="#ffffff" fillOpacity="1" d="M0,64L1440,224L1440,320L0,320Z"></path>
            </svg>
        </div>
      </div>

      <div className="p-8 bg-white -mt-20 relative z-10">
        <h1 className="text-3xl font-bold text-[#4338CA] mb-6">
          {isSignUp ? 'Create Account' : 'Hello again!'}
        </h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                    {...register('fullName')}
                    type="text"
                    placeholder="Enter your full name"
                    className="mt-1 auth-input-new"
                />
                {getErrorMessage('fullName')}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                  {...register('email')}
                  type="email"
                  placeholder="Enter your email"
                  className="mt-1 auth-input-new"
              />
              {getErrorMessage('email')}
            </div>

            <div>
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input
                    {...register('password')}
                    type='password'
                    placeholder="Enter your password"
                    className="mt-1 auth-input-new"
                />
                {getErrorMessage('password')}
            </div>

            <div className="pt-2">
              <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-lg text-white font-bold bg-gradient-to-r from-[#6366F1] to-[#818CF8] shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/40"
              >
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isSignUp ? 'Sign up' : 'Login'}
              </Button>
            </div>
        </form>

        <div className="mt-6 text-center text-sm">
            {isSignUp ? (
                <>
                    <p className="text-gray-600">
                        By signing up, you agree to our <Link href="/terms-of-service" className="font-medium text-[#4338CA] hover:underline">Terms</Link>.
                    </p>
                    <p className="text-gray-600 mt-2">
                        Already have an account?{' '}
                        <button onClick={() => handleModeChange('login')} className="font-medium text-[#4338CA] hover:underline">
                            Login
                        </button>
                    </p>
                </>
            ) : (
                <>
                    <Link href="#" className="font-medium text-gray-600 hover:text-[#4338CA]">
                        Forgot your password?
                    </Link>
                    <p className="text-gray-600 mt-2">
                        Don&apos;t have an account?{' '}
                        <button onClick={() => handleModeChange('signup')} className="font-medium text-[#4338CA] hover:underline">
                        Sign up
                        </button>
                    </p>
                </>
            )}
        </div>
      </div>
    </div>
  );
}