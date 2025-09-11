
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { signInUser } from '@/lib/auth-actions';
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
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const result = await signInUser(data);
    if (result.success) {
      toast({ title: 'Success', description: 'Logged in successfully!' });
      router.push('/');
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
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M19.3,4.992c-1.722-1.74-4.22-1.833-5.908-.135-1.74,1.722-1.833,4.22-.135,5.908,1.722,1.74,4.22,1.833,5.908.135,1.74-1.722,1.833-4.22.135-5.908m-6.079,3.424c.038.528-.188,1.267-.533,1.871-.413.71-.962,1.488-1.71,1.488-.71,0-1.125-.638-1.575-1.254-.525-.722-1.074-1.883-1.025-2.887.05-.989.813-2.074,1.6-2.074.675,0,1.213.6,1.65,1.225.388.54.85,1.488,1.593,1.629m5.542.457c-1.65,0-2.812-1.225-2.812-1.225s.087-1.425.95-2.062c.787-.563,1.85-.563,2.287-.037.025.025-1.1,1.213-1.1,2.05,0,.925.962,1.312,1.587,1.012a.69.69,0,0,0,.1-.25Z"/></svg>
  );

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 lg:hidden">
            <Image
              src="https://picsum.photos/seed/crextio-login/800/1200"
              alt="Background"
              layout="fill"
              objectFit="cover"
              className="z-0"
              data-ai-hint="team meeting"
            />
            <div className="absolute inset-0 bg-black/60 z-10" />
        </div>
       
        <div className="w-full max-w-4xl grid lg:grid-cols-2 shadow-2xl overflow-hidden rounded-2xl z-20 bg-transparent lg:bg-card">
          <div className="p-8 sm:p-12 flex flex-col justify-center bg-card/80 backdrop-blur-sm lg:bg-card lg:backdrop-blur-none rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none">
            <Link href="/" className="w-fit">
              <Button variant="outline" className="rounded-full px-4 mb-8 text-muted-foreground group">
                 <Icons.logo className="h-5 w-5 mr-2 text-primary group-hover:text-primary transition-colors"/> My Mart
              </Button>
            </Link>

            <h1 className="text-3xl font-bold font-headline mb-2">Welcome Back!</h1>
            <p className="text-muted-foreground text-sm mb-8">Sign in to continue to your account.</p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Email</FormLabel>
                      <FormControl>
                        <Input className="bg-muted/50 border-0 rounded-xl h-12" type="email" placeholder="you@example.com" {...field} />
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
                      <FormLabel className="text-xs">Password</FormLabel>
                      <FormControl>
                        <Input className="bg-muted/50 border-0 rounded-xl h-12" type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full font-bold mt-4 h-12 rounded-xl btn-primary" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </Form>

             <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card/80 lg:bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-12 rounded-xl"><AppleIcon className="h-5 w-5 mr-2" /> Apple</Button>
                <Button variant="outline" className="h-12 rounded-xl"><GoogleIcon className="h-5 w-5 mr-2" /> Google</Button>
            </div>

            <div className="mt-8 text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="underline text-primary font-semibold hover:text-primary/80">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
          <div className="hidden lg:block relative">
            <Image
              src="https://picsum.photos/seed/crextio-login/800/1200"
              alt="People in a meeting"
              width="800"
              height="1200"
              data-ai-hint="team meeting"
              className="h-full w-full object-cover"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/20 to-transparent p-8 flex flex-col justify-end">
                <AnimatedAuthText />
             </div>
          </div>
        </div>
         <div className="lg:hidden absolute bottom-8 z-10 text-center px-8">
            <AnimatedAuthText />
        </div>
    </main>
  );
}

    