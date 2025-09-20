
import Image from "next/image";
import Link from 'next/link';
import { X } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background/80 text-foreground flex items-center justify-center p-4">
      <div className="relative grid grid-cols-1 md:grid-cols-2 max-w-6xl w-full h-[700px] bg-white dark:bg-card shadow-2xl rounded-3xl overflow-hidden">
        
        {/* Close Button */}
        <Link href="/" aria-label="Close" className="absolute top-4 right-4 z-20">
            <div className="bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors">
                <X className="h-5 w-5" />
            </div>
        </Link>
        
        {/* Left Panel: Form */}
        <div className="flex flex-col bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 dark:from-neutral-900/90 dark:to-neutral-800/90">
           {children}
        </div>

        {/* Right Panel: Image */}
        <div className="hidden md:flex relative items-end justify-center text-white">
            <Image
                src="https://picsum.photos/seed/auth-meeting-new/800/1200"
                alt="People in a meeting"
                fill
                className="object-cover"
                quality={90}
                sizes="(max-width: 768px) 0vw, 50vw"
                data-ai-hint="team collaboration"
            />
        </div>
      </div>
    </div>
  );
}
