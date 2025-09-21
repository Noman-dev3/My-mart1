'use client';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        {/* On mobile, this will be a single column. On desktop, it's the container for the two-column layout. */}
        <div className="w-full max-w-sm md:max-w-4xl">
            {children}
        </div>
    </div>
  );
}
