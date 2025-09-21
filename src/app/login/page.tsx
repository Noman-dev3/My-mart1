'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { signInUser, signInWithGoogle } from '@/lib/auth-actions';
import { Icons } from '@/components/icons';
import Image from 'next/image';
import AnimatedAuthText from '@/components/animated-auth-text';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const result = await signInUser(data);
    if (result && !result.error) {
      toast({ title: 'Success', description: 'Logged in successfully!' });
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
      router.refresh(); // This is important to update server components with new auth state
    } else {
      toast({
        title: 'Login Failed',
        description: result.error || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  };
  
  const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" {...props}><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.596,44,31.1,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
  );

  const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 0C9.656 0 7.817.918 6.68 2.375c-1.137 1.458-1.32 3.666-.375 5.75-.956.478-2.022.717-3.2.717C1.925 8.842.859 8.602 0 8.125c.945-2.084.762-4.292-.375-5.75C.817.918 2.656 0 5 0h7zm0 24c2.344 0 4.183-.918 5.32-2.375 1.137-1.458 1.32-3.666.375-5.75.956-.478 2.022-.717 3.2-.717 1.178 0 2.244.24 3.2.717-.945 2.084-.762 4.292.375 5.75C22.817 23.082 20.978 24 18.634 24H12z"/></svg>
  );

  return (
    <main className="w-full max-w-4xl grid lg:grid-cols-2 shadow-2xl overflow-hidden rounded-2xl z-20">
        <div className="hidden lg:block relative">
            <Image
                src="https://picsum.photos/seed/login-ui/800/1200"
                alt="People in a meeting"
                width="800"
                height="1200"
                data-ai-hint="team meeting"
                className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-8 flex flex-col justify-between">
                <Link href="/" className="w-fit">
                    <Button variant="ghost" className="rounded-full px-4 text-white/80 hover:text-white hover:bg-white/10 group">
                        <Icons.logo className="h-5 w-5 mr-2 text-white/80 group-hover:text-white transition-colors"/> My Mart
                    </Button>
                </Link>
                <AnimatedAuthText />
            </div>
        </div>

        <div className="p-8 sm:p-12 flex flex-col justify-center bg-gray-800 rounded-2xl lg:rounded-l-none lg:rounded-r-2xl">
            <div className="lg:hidden mb-8">
                 <Link href="/" className="w-fit">
                    <Button variant="ghost" className="rounded-full px-4 text-white/80 hover:text-white hover:bg-white/10 group">
                        <Icons.logo className="h-5 w-5 mr-2 text-white/80 group-hover:text-white transition-colors"/> My Mart
                    </Button>
                </Link>
            </div>
            <h1 className="text-3xl font-bold font-headline mb-2 text-white">Welcome Back!</h1>
            <p className="text-gray-400 text-sm mb-8">Sign in to continue to your account.</p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-gray-300">Email</FormLabel>
                      <FormControl>
                        <Input className="auth-input" type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-gray-300">Password</FormLabel>
                      <FormControl>
                        <Input className="auth-input" type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                       <div className="text-right">
                         <Link href="#" className="text-xs text-indigo-400 hover:underline">Forgot password?</Link>
                       </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="auth-button-primary" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </Form>

             <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-600"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-800 px-2 text-gray-400">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button className="auth-button-secondary">
                  <AppleIcon className="h-5 w-5" />
                  Apple
                </button>
                <form action={signInWithGoogle}>
                  <button type="submit" className="auth-button-secondary w-full">
                    <GoogleIcon className="h-5 w-5" />
                     Google
                  </button>
                </form>
            </div>

            <div className="mt-8 text-center text-sm">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link href="/signup" className="underline text-indigo-400 font-semibold hover:text-indigo-300">
                  Sign up
                </Link>
              </p>
            </div>
        </div>
    </main>
  );
}
