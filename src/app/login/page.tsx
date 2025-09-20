'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { registerUser, signInUser, signInWithGoogle } from '@/lib/auth-actions';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export default function AuthenticationPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const activeSchema = isSignUp ? signupSchema : loginSchema;

  const form = useForm({
    resolver: zodResolver(activeSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof activeSchema>) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        const signupValues = values as z.infer<typeof signupSchema>;
        const result = await registerUser({ name: signupValues.fullName, email: signupValues.email, password: signupValues.password });
        if (result.success) {
          toast({
            title: 'Account Created!',
            description: 'Please check your email to verify your account.',
          });
          setIsSignUp(false);
          form.reset();
        } else {
          toast({
            title: 'Registration Failed',
            description: result.error,
            variant: 'destructive',
          });
        }
      } else {
        const loginValues = values as z.infer<typeof loginSchema>;
        const result = await signInUser(loginValues);
        if (result && result.error) {
          toast({
            title: 'Login Failed',
            description: result.error,
            variant: 'destructive',
          });
        }
        // On success, server action redirects.
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signInWithGoogle();
  };

  return (
    <div className="w-full max-w-md space-y-6 rounded-lg bg-card p-8 shadow-sm">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isSignUp ? 'Create an account' : 'Sign in to your account'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to {isSignUp ? 'create your account' : 'login'}
        </p>
      </div>

      <div className="grid gap-6">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            {isSignUp && (
              <div className="grid gap-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="John Doe" type="text" {...form.register('fullName')} disabled={isLoading} />
                {form.formState.errors.fullName && <p className="text-xs text-destructive">{String(form.formState.errors.fullName.message)}</p>}
              </div>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="name@example.com" type="email" {...form.register('email')} disabled={isLoading} />
              {form.formState.errors.email && <p className="text-xs text-destructive">{String(form.formState.errors.email.message)}</p>}
            </div>
            <div className="grid gap-1.5 relative">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type={showPassword ? 'text' : 'password'} {...form.register('password')} disabled={isLoading} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute bottom-2 right-3 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              {form.formState.errors.password && <p className="text-xs text-destructive">{String(form.formState.errors.password.message)}</p>}
            </div>
            <Button disabled={isLoading} className="w-full mt-4">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button variant="outline" type="button" disabled={isLoading} onClick={handleGoogleSignIn}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 488 512">
              <path d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 265.8 0 129.5 109.8 20 244 20c74.8 0 134.3 29.3 179.6 71.9l-65.4 64.2c-28.5-27.1-65.4-46.3-114.2-46.3-86.4 0-157.1 70.3-157.1 156.6 0 86.3 70.7 156.6 157.1 156.6 99.9 0 138.2-79.5 142.7-116.7H244V261.8h244z" fill="currentColor"></path>
            </svg>
          )}
          Google
        </Button>
      </div>
      <p className="px-8 text-center text-sm text-muted-foreground">
        {isSignUp ? (
          <>
            Already have an account?{' '}
            <button
              onClick={() => { setIsSignUp(false); form.reset(); }}
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign In
            </button>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <button
              onClick={() => { setIsSignUp(true); form.reset(); }}
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign Up
            </button>
          </>
        )}
      </p>
    </div>
  );
}
