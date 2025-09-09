import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AnimationWrapper from '@/components/animation-wrapper';
import { CartProvider } from '@/context/cart-context';

export const metadata: Metadata = {
  title: 'My Mart',
  description: 'Your one-stop online shop.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <CartProvider>
          <AnimationWrapper>{children}</AnimationWrapper>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
