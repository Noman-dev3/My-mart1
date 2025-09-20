
import Image from 'next/image';
import { Calendar, User, Video, CheckSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-6xl w-full mx-auto bg-background rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Left Panel: Form */}
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          {children}
        </div>

        {/* Right Panel: Visual Showcase */}
        <div className="hidden md:block relative p-8 bg-gray-900 overflow-hidden">
          <Image
            src="https://picsum.photos/seed/conference/1000/1200"
            alt="Video conference UI"
            fill
            className="object-cover opacity-20 blur-sm"
            data-ai-hint="people working"
          />
          <div className="relative z-10 text-white h-full flex flex-col justify-between">
            {/* Top section with Avatars */}
            <div className="space-y-6">
                <div className="flex -space-x-4">
                    <Avatar className="border-2 border-gray-700 h-14 w-14">
                        <AvatarImage src="https://picsum.photos/seed/avatar1/100" />
                        <AvatarFallback>U1</AvatarFallback>
                    </Avatar>
                     <Avatar className="border-2 border-gray-700 h-14 w-14">
                        <AvatarImage src="https://picsum.photos/seed/avatar2/100" />
                        <AvatarFallback>U2</AvatarFallback>
                    </Avatar>
                     <Avatar className="border-2 border-gray-700 h-14 w-14">
                        <AvatarImage src="https://picsum.photos/seed/avatar3/100" />
                        <AvatarFallback>U3</AvatarFallback>
                    </Avatar>
                    <Avatar className="border-2 border-gray-700 h-14 w-14 bg-gray-600">
                        <AvatarFallback className="text-sm">+5</AvatarFallback>
                    </Avatar>
                </div>
                <h2 className="font-headline text-4xl font-bold max-w-sm">
                    Join millions of users worldwide.
                </h2>
            </div>
            
            {/* Bottom section with floating cards */}
            <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex items-center gap-4 border border-white/20">
                    <div className="bg-green-500/20 p-2 rounded-lg"><CheckSquare className="text-green-300"/></div>
                    <div>
                        <p className="font-semibold">Task Review With Team</p>
                        <p className="text-sm text-gray-300">11:00 - 12:00 PM</p>
                    </div>
                </div>
                 <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex items-center gap-4 border border-white/20">
                    <div className="bg-purple-500/20 p-2 rounded-lg"><Video className="text-purple-300"/></div>
                    <div>
                        <p className="font-semibold">Daily Meeting</p>
                        <p className="text-sm text-gray-300">Important updates</p>
                    </div>
                </div>
            </div>

            {/* Absolute positioned calendar */}
             <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                <p className="text-xs font-semibold text-center mb-1">DEC</p>
                <div className="bg-yellow-400 text-black rounded-lg w-10 h-10 flex items-center justify-center font-bold text-xl">
                    25
                </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
