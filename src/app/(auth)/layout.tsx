'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Icons } from '@/components/icons';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 font-sans lg:grid-cols-2">
      <div className="relative flex-col items-center justify-center hidden h-full bg-gray-900 text-white lg:flex">
         <Image
            src="https://picsum.photos/seed/store/1200/1800"
            alt="E-commerce products"
            fill
            className="object-cover opacity-30"
            data-ai-hint="online shopping store"
        />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Icons.logo className="mr-2 h-8 w-8" />
          <span className="font-headline text-3xl">My Mart</span>
        </div>
        <div className="relative z-20 mt-auto p-10">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This is the best online store I've ever used. The quality and service are unparalleled.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="relative flex items-center justify-center p-8">
         <Link href="/" className="absolute right-4 top-4 text-sm font-medium text-muted-foreground hover:text-primary md:right-8 md:top-8">
            Back to Store
        </Link>
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
             {children}
        </div>
      </div>
    </div>
  );
}
