'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { signInUser, signInWithGoogle } from '@/lib/auth-actions';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Icons } from '@/components/icons';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    const result = await signInUser(values);
    if (result && result.error) {
      toast({
        title: 'Login Failed',
        description: result.error,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
    // On success, the server action handles the redirect.
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    await signInWithGoogle();
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-left mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
        <p className="text-muted-foreground mt-1">Sign in to continue to your account.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="amelielaurent7622@gmail.com" {...field} className="h-12 rounded-xl bg-white dark:bg-gray-800" />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} className="h-12 rounded-xl bg-white dark:bg-gray-800 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 text-black hover:from-yellow-500 hover:to-yellow-400" disabled={isSubmitting}>
             {isSubmitting ? <Loader2 className="animate-spin" /> : 'Sign In'}
          </Button>
        </form>
      </Form>
      
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-yellow-100 dark:bg-yellow-900/50 px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      
       <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-12 rounded-xl" disabled>
            <Icons.logo className="h-5 w-5 mr-2" /> Apple
        </Button>
        <form action={handleGoogleSignIn} className="w-full">
            <Button type="submit" variant="outline" className="w-full h-12 rounded-xl" disabled={isSubmitting}>
                <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 265.8 0 129.5 109.8 20 244 20c74.8 0 134.3 29.3 179.6 71.9l-65.4 64.2c-28.5-27.1-65.4-46.3-114.2-46.3-86.4 0-157.1 70.3-157.1 156.6 0 86.3 70.7 156.6 157.1 156.6 99.9 0 138.2-79.5 142.7-116.7H244V261.8h244z"></path></svg>
                Google
            </Button>
        </form>
      </div>

      <div className="mt-12 text-center text-sm">
        <p className="text-muted-foreground">
          Don't have an account? <Link href="/signup" className="font-semibold text-primary hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}