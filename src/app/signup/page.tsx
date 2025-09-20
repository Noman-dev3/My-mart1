
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { registerUser, signInWithGoogle } from '@/lib/auth-actions';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Icons } from '@/components/icons';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: SignupFormValues) => {
    const result = await registerUser(data);
    if (result.success) {
      toast({
        title: 'Account Created!',
        description: 'Please check your email to verify your account.',
        duration: 10000,
      });
      router.push('/login');
    } else {
      toast({
        title: 'Signup Failed',
        description: result.error || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8">
      <div className="text-center md:text-left mb-10">
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Create an account</h1>
        <p className="text-muted-foreground mt-2">Let&apos;s get started with your 30-day free trial.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
           <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John Doe" 
                    {...field} 
                    className="h-12 rounded-xl bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="you@example.com" 
                    {...field} 
                    className="h-12 rounded-xl bg-white"
                  />
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
                    <Input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••••••" 
                      {...field} 
                      className="h-12 rounded-xl bg-white pr-10"
                    />
                     <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting}
            className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-br from-yellow-300 to-white text-black"
          >
            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Account'}
          </Button>
        </form>
      </Form>
      
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
         <form>
             <Button variant="outline" type="button" className="w-full h-12 rounded-xl bg-white">
                <Icons.logo className="mr-2 h-5 w-5" />
                Apple
            </Button>
         </form>
         <form action={signInWithGoogle}>
            <Button variant="outline" type="submit" className="w-full h-12 rounded-xl bg-white">
                 <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.222,0-9.619-3.317-11.28-7.962l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574	l6.19,5.238C44.434,36.338,48,30.659,48,24C48,22.659,47.862,21.35,47.611,20.083z"></path></svg>
                Google
            </Button>
         </form>
      </div>

       <p className="px-8 text-center text-sm text-muted-foreground mt-12">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4 hover:text-primary font-semibold">
          Sign In
        </Link>
      </p>
    </div>
  );
}
