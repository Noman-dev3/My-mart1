
'use client';

import Image from 'next/image';
import { Calendar, Clock, Video, Plus } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 font-sans">
      <div className="relative grid w-full max-w-5xl grid-cols-1 md:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl bg-white dark:bg-gray-800">
        
        {/* Left Side (Form) */}
        <div className="bg-gradient-to-br from-yellow-50/50 via-yellow-100/60 to-yellow-200/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/80 p-8 sm:p-12 flex flex-col justify-center">
            {children}
        </div>

        {/* Right Side (Image & UI Elements) */}
        <div className="relative hidden md:block">
           <Link href="/" passHref>
                <button className="absolute top-4 right-4 z-20 text-gray-500 bg-white/50 dark:bg-black/50 dark:text-gray-300 rounded-full p-1.5 hover:bg-white dark:hover:bg-black transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </Link>
          <Image
            src="https://picsum.photos/seed/meeting/800/1000"
            alt="Team meeting"
            fill
            className="object-cover rounded-tl-3xl"
            data-ai-hint="team meeting office"
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] rounded-tl-3xl"></div>

          {/* Floating UI Elements */}
          <div className="absolute inset-0 p-8 flex flex-col justify-between">
            {/* Top Card */}
            <div className="relative self-end w-fit">
              <div className="bg-yellow-400 dark:bg-yellow-500 text-black p-3 rounded-lg shadow-lg">
                <h4 className="font-bold text-sm">Task Review With Team</h4>
                <p className="text-xs flex items-center gap-1"><Clock size={12} /> 09:00AM-09:30AM</p>
              </div>
               <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-yellow-400 dark:bg-yellow-500 flex items-center justify-center shadow-md">
                 <Video size={14} className="text-black" />
               </div>
            </div>
            
            {/* Bottom Section */}
            <div className="relative">
                {/* User Avatars */}
                 <div className="absolute -top-12 right-0 flex -space-x-2">
                    <Avatar className="h-8 w-8 border-2 border-white/80 dark:border-gray-800">
                        <AvatarImage src="https://i.pravatar.cc/150?img=1" />
                        <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                     <Avatar className="h-8 w-8 border-2 border-white/80 dark:border-gray-800">
                        <AvatarImage src="https://i.pravatar.cc/150?img=2" />
                        <AvatarFallback>B</AvatarFallback>
                    </Avatar>
                     <Avatar className="h-8 w-8 border-2 border-white/80 dark:border-gray-800">
                        <AvatarImage src="https://i.pravatar.cc/150?img=3" />
                        <AvatarFallback>C</AvatarFallback>
                    </Avatar>
                </div>
              <div className="flex items-end gap-4">
                {/* Calendar */}
                <div className="w-48 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-3 rounded-2xl shadow-lg text-gray-800 dark:text-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-sm">December</p>
                    <div className="flex gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 text-center text-xs gap-y-1 text-gray-600 dark:text-gray-400">
                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                    {[...Array(31)].map((_, i) => (
                      <span key={i} className={cn("py-0.5", i + 1 === 25 && "bg-yellow-400 dark:bg-yellow-500 text-black rounded-full font-bold")}>
                        {i + 1}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Daily Meeting Card */}
                <div className="flex-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg text-gray-800 dark:text-gray-200">
                  <h4 className="font-bold">Daily Meeting</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1"><Clock size={12} /> 10:00AM-10:30AM</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex -space-x-2">
                      <Avatar className="h-6 w-6 border-2 border-white/80 dark:border-gray-900/80">
                        <AvatarImage src="https://i.pravatar.cc/150?img=4" />
                        <AvatarFallback>D</AvatarFallback>
                      </Avatar>
                       <Avatar className="h-6 w-6 border-2 border-white/80 dark:border-gray-900/80">
                        <AvatarImage src="https://i.pravatar.cc/150?img=5" />
                        <AvatarFallback>E</AvatarFallback>
                      </Avatar>
                       <Avatar className="h-6 w-6 border-2 border-white/80 dark:border-gray-900/80">
                         <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[8px]"><Plus size={10}/></AvatarFallback>
                      </Avatar>
                    </div>
                    <button className="h-7 w-7 rounded-full bg-yellow-400 dark:bg-yellow-500 flex items-center justify-center text-black shadow-md">
                      <Video size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
