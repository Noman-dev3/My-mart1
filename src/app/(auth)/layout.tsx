'use client';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#F0FBF7] p-4 sm:p-6 lg:p-8 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-[#E3F8EE] rounded-full opacity-50"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-80 h-80 bg-[#E3F8EE] rounded-full opacity-50"></div>
        <div className="absolute top-[15%] right-[10%] w-8 h-8 bg-white/50 rounded-lg rotate-45"></div>
        <div className="absolute bottom-[20%] left-[15%] w-6 h-6 bg-white/50 rounded-md rotate-12"></div>
        
        <main className="relative z-10 w-full max-w-5xl">
            {children}
        </main>
    </div>
  );
}
