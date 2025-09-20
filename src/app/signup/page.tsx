
'use client';

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
import { Icons } from '@/components/icons';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [passwordVisible, setPasswordVisible] = useState(false);

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

  const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" {...props}><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.596,44,31.1,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
  );

  return (
    <div className="flex-1 p-8 sm:p-12 md:p-16 flex flex-col justify-center">
        <Link href="/" className="mb-8 w-fit flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Icons.logo className="h-6 w-6"/>
            <span className="font-headline text-xl font-semibold">My Mart</span>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold font-headline">Create an account</h1>
        <p className="text-muted-foreground mt-2">Sign up to start your shopping journey.</p>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Amélie Laurent" {...field} className="h-12 text-base rounded-xl bg-white" />
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
                        <Input type="email" placeholder="amelielaurent7622@gmail.com" {...field} className="h-12 text-base rounded-xl bg-white" />
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
                       <div className="relative">
                            <FormControl>
                                <Input 
                                    type={passwordVisible ? "text" : "password"} 
                                    placeholder="••••••••••••" 
                                    {...field} 
                                    className="h-12 text-base rounded-xl bg-white pr-10"
                                />
                            </FormControl>
                            <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground">
                                {passwordVisible ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                            </button>
                        </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full font-bold h-14 rounded-2xl text-base bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Account'}
                </Button>
            </form>
        </Form>
        
        <div className="mt-6 space-y-4">
             <form action={signInWithGoogle} className="w-full">
                <Button variant="outline" className="w-full h-14 rounded-2xl border-gray-300 text-base">
                    <GoogleIcon className="mr-3 h-6 w-6" />
                    Sign up with Google
                </Button>
            </form>
        </div>

        <div className="mt-auto pt-8 text-center text-sm">
            <p className="text-muted-foreground">
                Have an account?{" "}
                <Link href="/login" className="font-semibold text-yellow-500 hover:underline">
                    Sign in
                </Link>
            </p>
            <Link href="/terms-of-service" className="text-muted-foreground hover:underline mt-2 inline-block">
                Terms & Conditions
            </Link>
        </div>
    </div>
  );
}

    