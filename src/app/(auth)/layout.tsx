'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-[#2F2B3B] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl shadow-2xl lg:grid-cols-2">
        
        {/* Left Panel: Image and Branding */}
        <div className="relative hidden flex-col justify-between bg-[#2F2B3B] p-8 text-white lg:flex">
          <div className="absolute inset-0">
            <Image
              src="https://picsum.photos/seed/dunes/800/1200"
              alt="Desert dunes"
              fill
              className="object-cover"
              quality={100}
              data-ai-hint="desert dune"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-wider">AMU</h1>
            <Link href="/" className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-white/20">
              Back to website &rarr;
            </Link>
          </div>

          <div className="relative z-10">
            <p className="max-w-xs text-xl">
              Capturing Moments, Creating Memories
            </p>
            <div className="mt-4 flex items-center space-x-2">
              <span className="h-1 w-8 rounded-full bg-white/20"></span>
              <span className="h-1 w-8 rounded-full bg-white/20"></span>
              <span className="h-1 w-8 rounded-full bg-white"></span>
            </div>
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="flex flex-col justify-center bg-[#211E29] p-8 sm:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}
