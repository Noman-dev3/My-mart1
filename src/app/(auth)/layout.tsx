
import Image from "next/image";
import AnimatedAuthText from "@/components/animated-auth-text";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl w-full bg-white dark:bg-card shadow-2xl rounded-2xl overflow-hidden">
        <div className="flex flex-col bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 dark:from-neutral-900 dark:to-neutral-800">
           {children}
        </div>
        <div className="hidden md:flex relative items-end justify-center p-12 text-white bg-gray-900">
            <Image
                src="https://picsum.photos/seed/auth-meeting/800/1200"
                alt="People in a meeting"
                fill
                className="object-cover"
                quality={90}
                data-ai-hint="team collaboration"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="relative z-10 w-full">
                <AnimatedAuthText />
            </div>
        </div>
      </div>
    </div>
  );
}

    