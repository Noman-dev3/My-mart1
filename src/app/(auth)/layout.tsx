'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { X, CalendarDays, Video, CheckCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const AnimatedText = () => {
    const texts = [
        "Discover products you'll love.",
        "Shop the latest trends with ease.",
        "Your one-stop e-commerce destination.",
    ];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % texts.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [texts.length]);

    return (
        <AnimatePresence mode="wait">
            <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-lg font-medium text-white"
            >
                {texts[index]}
            </motion.p>
        </AnimatePresence>
    );
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden">
        {/* Left Panel - Form */}
        <div className="p-8 sm:p-12 bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 dark:from-yellow-900/50 dark:via-yellow-800/50 dark:to-yellow-700/50 flex flex-col justify-between">
          <div className="flex-shrink-0">
             <Button asChild variant="outline" className="rounded-full font-semibold border-gray-300 dark:border-gray-600">
                <Link href="/">My Mart</Link>
            </Button>
          </div>
          <div className="flex-grow flex items-center">
            {children}
          </div>
          <div className="flex-shrink-0" /> {/* Spacer */}
        </div>

        {/* Right Panel - Image and Decorative UI */}
        <div className="relative hidden md:block">
          <Image
            src="https://picsum.photos/seed/meeting/1000/1200"
            alt="Team meeting"
            fill
            className="object-cover"
            data-ai-hint="team meeting"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

          <Button asChild variant="ghost" size="icon" className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10">
            <Link href="/"><X /></Link>
          </Button>

          <div className="absolute top-16 left-8 w-64 p-4 bg-black/30 backdrop-blur-lg rounded-xl border border-white/10 text-white">
            <div className="flex items-center justify-between">
              <h4 className="font-bold">Task Review With Team</h4>
              <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
            </div>
            <p className="text-xs text-white/70 mt-1">09:30am - 10:00am</p>
          </div>

          <div className="absolute top-40 right-8 flex space-x-2">
            <Image src="https://picsum.photos/seed/avatar1/48/48" alt="avatar" width={48} height={48} className="rounded-full border-2 border-white/50" data-ai-hint="person face" />
            <Image src="https://picsum.photos/seed/avatar2/48/48" alt="avatar" width={48} height={48} className="rounded-full border-2 border-white/50" data-ai-hint="person face" />
             <Image src="https://picsum.photos/seed/avatar3/48/48" alt="avatar" width={48} height={48} className="rounded-full border-2 border-white/50" data-ai-hint="person face" />
          </div>
          
          <div className="absolute bottom-8 left-0 right-0 px-8">
            <div className="p-4 bg-black/30 backdrop-blur-lg rounded-xl border border-white/10 text-white flex items-center justify-center">
                <AnimatedText />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
