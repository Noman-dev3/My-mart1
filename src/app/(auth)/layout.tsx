'use client';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-start justify-center bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md mt-10 sm:mt-20">
            {children}
        </div>
    </div>
  );
}
