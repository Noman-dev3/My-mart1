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
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
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
    }
    // On success, the server action handles the redirect.
    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    await signInWithGoogle();
    // This will redirect, so no need to set isSubmitting to false
  };

  return (
    <div className="w-full max-w-md mx-auto text-white">
      <div className="text-left mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Sign in to your account</h1>
        <p className="text-gray-400 mt-2 text-sm">
          Don't have an account? <Link href="/signup" className="font-semibold text-[#A162F7] hover:underline">Sign up</Link>
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Email" {...field} className="h-12 bg-[#3D3A5D] border-[#5C5A7A] focus-visible:ring-[#A162F7]" />
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
                <FormControl>
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" {...field} className="h-12 bg-[#3D3A5D] border-[#5C5A7A] focus-visible:ring-[#A162F7] pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full h-12 text-base font-bold bg-[#A162F7] hover:bg-[#8e49f5]" disabled={isSubmitting}>
             {isSubmitting && !form.formState.isValid ? <Loader2 className="animate-spin" /> : 'Log in'}
          </Button>
        </form>
      </Form>
      
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-600" />
        </div>
        <div className="relative flex justify-center text-xs">
            <span className="bg-[#2D2A4C] px-2 text-gray-400">Or register with</span>
        </div>
      </div>
      
       <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-12 bg-[#3D3A5D] border-[#5C5A7A] hover:bg-[#4c4974] hover:text-white" disabled>
            <Icons.logo className="h-5 w-5 mr-2" /> Apple
        </Button>
        <form action={handleGoogleSignIn} className="w-full">
            <Button type="submit" variant="outline" className="w-full h-12 bg-[#3D3A5D] border-[#5C5A7A] hover:bg-[#4c4974] hover:text-white" disabled={isSubmitting}>
                 {isSubmitting ? <Loader2 className="animate-spin" /> : <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 265.8 0 129.5 109.8 20 244 20c74.8 0 134.3 29.3 179.6 71.9l-65.4 64.2c-28.5-27.1-65.4-46.3-114.2-46.3-86.4 0-157.1 70.3-157.1 156.6 0 86.3 70.7 156.6 157.1 156.6 99.9 0 138.2-79.5 142.7-116.7H244V261.8h244z"></path></svg>}
                Google
            </Button>
        </form>
      </div>
    </div>
  );
}