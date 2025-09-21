'use client';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-900 p-4">
        <div className="absolute inset-0 z-0">
            <Image
                src="https://picsum.photos/seed/auth-bg-full/1920/1080"
                alt="Abstract background"
                fill
                className="object-cover"
                data-ai-hint="abstract texture"
            />
            <div className="absolute inset-0 bg-black/50" />
        </div>
        {/* This container will perfectly center the children on all screen sizes. */}
        <div className="relative z-10 w-full max-w-sm md:max-w-4xl flex items-center justify-center">
            {children}
        </div>
    </div>
  );
}
