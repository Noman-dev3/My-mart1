'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { registerUser, signInUser } from '@/lib/auth-actions';
import { Loader2, ChevronDown } from 'lucide-react';
import { Icons } from '@/components/icons';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthenticationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  
  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await signInUser(values);
      if (result && result.error) {
        toast({
          title: 'Login Failed',
          description: result.error,
          variant: 'destructive',
        });
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
  
  const getErrorMessage = (field: keyof LoginFormValues) => {
    const error = errors[field as keyof typeof errors];
    return error ? <p className="text-xs text-red-500 mt-1">{String(error.message)}</p> : null;
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Left Side: Form */}
            <div className="p-8 sm:p-12 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xl text-green-800">BonSanté</span>
                        </div>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-600">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="15" viewBox="0 0 20 15"><path fill="#00267f" d="M0 0h20v15H0z"/><path fill="#f3f3f3" d="M0 0h7.5v15H0z"/><path fill="#ef4135" d="M12.5 0H20v15h-7.5z"/></svg>
                           Fr
                           <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900">
                       Bonjour!
                    </h1>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm">
                         Pour vous connecter a votre compte, renseignez votre adresse email ainsi que votre mot de passe.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                        <div>
                            <input {...register('email')} type="email" placeholder="Votre adresse email" className="auth-input-bonsante"/>
                            {getErrorMessage('email')}
                        </div>
                        <div>
                            <input {...register('password')} type="password" placeholder="Votre mot de passe" className="auth-input-bonsante"/>
                             <Link href="#" className="text-xs text-green-600 hover:underline mt-1 block w-fit">Mot de passe oublié?</Link>
                            {getErrorMessage('password')}
                        </div>

                        <div className="pt-2">
                            <Button type="submit" disabled={isLoading} className="auth-button-bonsante">
                                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                Etape suivante
                            </Button>
                        </div>
                    </form>
                </div>
                
                <div className="text-center text-xs text-gray-500">
                     <p>N'hesitez pas a nous contacter <Link href="#" className="text-green-600 font-semibold hover:underline">support@bonsante.com</Link></p>
                     <p className="mt-4 text-gray-400">All rights reserved Betterise Technologies 2020</p>
                </div>
            </div>

            {/* Right Side: Image */}
            <div className="relative min-h-[400px] md:min-h-0">
                <Image 
                    src="https://picsum.photos/seed/bonsante/800/1000"
                    alt="Precision medicine"
                    fill
                    className="object-cover"
                    data-ai-hint="plant pot"
                />
                <div className="absolute inset-0 bg-gray-900/10 flex items-center justify-center p-8">
                     <div className="bg-white/50 backdrop-blur-md p-6 rounded-2xl max-w-sm w-full text-gray-800">
                        <div className="w-10 h-10 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <h2 className="text-2xl font-bold">
                            Precision medicine is the new gold standard for cancer treatment
                        </h2>
                        <p className="text-sm mt-2">
                            The resulting interactive report includes updated information about approved or investigational treatments for each patient.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
