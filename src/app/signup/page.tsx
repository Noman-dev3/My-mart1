'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { registerUser, signInWithGoogle } from '@/lib/auth-actions';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Icons } from '@/components/icons';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function SignupPage() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', terms: false },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    const result = await registerUser({ name: `${values.firstName} ${values.lastName}`, email: values.email, password: values.password });
    if (result.success) {
      form.reset();
      setShowSuccessMessage(true);
    } else {
      toast({
        title: 'Registration Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };
  
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    await signInWithGoogle();
  };

  if (showSuccessMessage) {
    return (
      <div className="w-full max-w-md mx-auto text-center text-white">
        <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
        <p className="text-gray-400 mt-2">
          We've sent a verification link to your email address. Please click the link to continue.
        </p>
         <div className="mt-8">
            <Link href="/">
                <Button className="bg-[#A162F7] hover:bg-[#8e49f5]">Back to Homepage</Button>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto text-white">
      <div className="text-left mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
        <p className="text-gray-400 mt-2 text-sm">
          Already have an account? <Link href="/login" className="font-semibold text-[#A162F7] hover:underline">Log in</Link>
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                        <Input placeholder="First name" {...field} className="h-12 bg-[#3D3A5D] border-[#5C5A7A] focus-visible:ring-[#A162F7]" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                        <Input placeholder="Last name" {...field} className="h-12 bg-[#3D3A5D] border-[#5C5A7A] focus-visible:ring-[#A162F7]" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
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
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                    <FormControl>
                        <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="bg-[#3D3A5D] border-[#5C5A7A] data-[state=checked]:bg-[#A162F7] data-[state=checked]:border-[#A162F7]"
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal text-gray-400">
                        I agree to the <Link href="/terms-of-service" className="text-[#A162F7] hover:underline">Terms & Conditions</Link>
                        </FormLabel>
                        <FormMessage />
                    </div>
                </FormItem>
            )}
            />
          <Button type="submit" className="w-full h-12 text-base font-bold bg-[#A162F7] hover:bg-[#8e49f5]" disabled={isSubmitting}>
             {isSubmitting ? <Loader2 className="animate-spin" /> : 'Create account'}
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
                <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 265.8 0 129.5 109.8 20 244 20c74.8 0 134.3 29.3 179.6 71.9l-65.4 64.2c-28.5-27.1-65.4-46.3-114.2-46.3-86.4 0-157.1 70.3-157.1 156.6 0 86.3 70.7 156.6 157.1 156.6 99.9 0 138.2-79.5 142.7-116.7H244V261.8h244z"></path></svg>
                Google
            </Button>
        </form>
      </div>
    </div>
  );
}
