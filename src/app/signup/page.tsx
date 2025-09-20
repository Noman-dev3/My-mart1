
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
import { Loader2 } from 'lucide-react';
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
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h1>Create an Account</h1>
      <p>Sign up to get started.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
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
            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Account'}
          </Button>
        </form>
      </Form>

      <div style={{ marginTop: '1rem' }}>
        <form action={signInWithGoogle}>
          <Button type="submit" variant="outline" style={{ width: '100%' }}>
            Sign up with Google
          </Button>
        </form>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <p>
          Already have an account?{" "}
          <Link href="/login" style={{ color: 'blue' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
