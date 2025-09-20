
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { signInUser, signInWithGoogle } from '@/lib/auth-actions';
import { Loader2 } from 'lucide-react';
import { Icons } from '@/components/icons';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const result = await signInUser(data);
    if (result?.error) {
      toast({
        title: 'Login Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h1>Login</h1>
      <p>Sign in to continue to your My Mart account.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
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
                  <Input type="password" placeholder="••••••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Sign In'}
          </Button>
        </form>
      </Form>
      
      <div style={{ marginTop: '1rem' }}>
        <form action={signInWithGoogle}>
          <Button type="submit" variant="outline" style={{ width: '100%' }}>
            Sign in with Google
          </Button>
        </form>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <p>
          Don't have an account?{" "}
          <Link href="/signup" style={{ color: 'blue' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
