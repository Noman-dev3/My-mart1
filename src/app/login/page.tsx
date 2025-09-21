'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { registerUser, signInUser, signInWithGoogle } from '@/lib/auth-actions';
import { Loader2, ArrowLeft, ArrowRight, Github, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    }, 5000);
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
  
   const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    setIsLoading(false);
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
  
  const MobileView = () => (
      <div className="bg-white rounded-3xl overflow-hidden w-full max-w-sm">
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
            <div className="absolute bottom-0 left-0 w-full h-12" style={{ transform: 'translateY(1px)' }}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-current text-white">
                    <path d="M0,0 C30,100 70,100 100,0 L100,100 L0,100 Z" />
                </svg>
            </div>
        </div>

        <div className="p-8 bg-white relative z-10">
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

  const DesktopView = () => (
     <div className="w-full h-full bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl grid md:grid-cols-2 min-h-[700px]">
        {/* Left Side - Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
            <Icons.logo className="h-7 w-7 text-white mb-8" />

            <h1 className="font-bold text-3xl text-white">
                {isSignUp ? 'Create Account' : 'Welcome back'}
            </h1>
            <p className="text-gray-300 mt-2 text-sm">
                {isSignUp ? 'Join us now!' : 'Please Enter your Account details'}
            </p>

             <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
                {isSignUp && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="text-xs text-gray-400">First Name</label>
                        <input
                            {...register('fullName')}
                            type="text"
                            placeholder="John"
                            className="mt-1 auth-input-desktop"
                        />
                        {getErrorMessage('fullName')}
                        </div>
                        <div>
                        <label className="text-xs text-gray-400">Last Name</label>
                        <input
                            {...register('lastName')}
                            type="text"
                            placeholder="Doe"
                            className="mt-1 auth-input-desktop"
                        />
                        {getErrorMessage('lastName')}
                        </div>
                    </div>
                )}
                <div>
                    <label className="text-xs text-gray-400">Email</label>
                    <input
                        {...register('email')}
                        type="email"
                        placeholder="Johndoe@gmail.com"
                        className="mt-1 auth-input-desktop"
                    />
                    {getErrorMessage('email')}
                </div>
                <div>
                    <label className="text-xs text-gray-400">Password</label>
                    <input
                        {...register('password')}
                        type="password"
                        placeholder="••••••••"
                        className="mt-1 auth-input-desktop"
                    />
                    {getErrorMessage('password')}
                </div>

                <div className="flex justify-between items-center text-xs">
                     <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                        <input type="checkbox" className="h-4 w-4 rounded-sm bg-gray-800 border-gray-600 text-pink-500 focus:ring-pink-500" />
                        Keep me logged in
                    </label>
                    <Link href="#" className="text-pink-400 hover:text-pink-300">
                        Forgot Password
                    </Link>
                </div>

                <Button type="submit" disabled={isLoading} className="auth-button-desktop">
                    {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    {isSignUp ? 'Create Account' : 'Sign in'}
                </Button>
            </form>

            <div className="flex items-center gap-4 mt-8">
                <p className="text-sm text-gray-400">Or with:</p>
                <div className="flex gap-3">
                    <button onClick={handleGoogleSignIn} className="auth-social-button"><svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.242,44,30.038,44,24c0,22.659-0.138,21.35-0.389,20.083z"></path></svg></button>
                    <button className="auth-social-button"><Github className="h-5 w-5"/></button>
                    <button className="auth-social-button"><Facebook className="h-5 w-5"/></button>
                </div>
            </div>
        </div>

        {/* Right Side - Content */}
        <div className="hidden md:flex flex-col p-8 sm:p-12 bg-black/20 rounded-r-2xl">
           <div className="relative p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10 flex-1 flex flex-col justify-between" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}>
                <div>
                    <h2 className="text-2xl font-bold text-white">What's our Jobseekers Said.</h2>
                    <p className="text-7xl text-gray-600 font-serif mt-4">"</p>
                    <p className="text-gray-300 -mt-8 ml-8">Search and find your dream job is now easier than ever. Just browse a job and apply if you need to.</p>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="font-semibold text-white">Mas Parjono</p>
                        <p className="text-xs text-gray-400">UI Designer at Google</p>
                    </div>
                     <div className="flex gap-2">
                        <button className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center text-white"><ArrowLeft size={16} /></button>
                        <button className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white"><ArrowRight size={16} /></button>
                    </div>
                </div>
           </div>

           <div className="relative p-6 -mt-10 ml-auto w-4/5 bg-white rounded-2xl shadow-lg" style={{ clipPath: 'polygon(40px 0, 100% 0, 100% 100%, 0 100%, 0 40px)' }}>
                <h3 className="font-bold text-gray-800">Get your right job and right place apply now</h3>
                <p className="text-xs text-gray-500 mt-1">Be among the first founders to experience the easiest way to start run a business.</p>
           </div>
        </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden">
        <MobileView />
      </div>
      <div className="hidden md:block">
        <DesktopView />
      </div>
    </>
  );
}
