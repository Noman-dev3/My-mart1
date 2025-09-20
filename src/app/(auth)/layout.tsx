'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Circle } from 'lucide-react';
import { Icons } from '@/components/icons';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#3F3C5F] p-4">
      <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 shadow-2xl rounded-2xl overflow-hidden bg-[#2D2A4C]">
        {/* Left Panel - Image */}
        <div className="relative hidden md:flex flex-col justify-between p-8">
            <Image
                src="https://picsum.photos/seed/desert-dunes/1000/1200"
                alt="Desert dunes"
                fill
                className="object-cover"
                data-ai-hint="desert dune"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            <div className="relative flex justify-between items-center z-10">
                <Icons.logo className="h-8 w-8 text-white/90" />
                <Button asChild variant="ghost" size="sm" className="bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-full">
                    <Link href="/">Back to website <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
            
            <div className="relative z-10 text-white text-center">
                <h2 className="text-2xl font-medium">Capturing Moments,<br />Creating Memories</h2>
                <div className="flex justify-center items-center gap-2 mt-4">
                    <Circle className="h-2 w-2 text-white/50 fill-current" />
                    <Circle className="h-2 w-2 text-white/50 fill-current" />
                    <div className="w-5 h-1 bg-white rounded-full"></div>
                </div>
            </div>
        </div>

        {/* Right Panel - Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
            {children}
        </div>
      </div>
    </div>
  );
}
