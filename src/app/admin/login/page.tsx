
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                 <Icons.logo className="h-8 w-8 text-primary" />
                 <span className="font-headline text-3xl font-bold text-primary">My Mart</span>
            </div>
          <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
          <CardDescription>Select a section to log in.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button asChild className="w-full">
                <Link href="/admin">Dashboard</Link>
            </Button>
            <Button asChild className="w-full">
                <Link href="/admin/products">Product Management</Link>
            </Button>
            <Button asChild className="w-full">
                <Link href="/admin/orders">Order Management</Link>
            </Button>
            <Button asChild className="w-full">
                <Link href="/admin/content">Content Management</Link>
            </Button>
            <Button asChild className="w-full">
                <Link href="/admin/settings">Store Settings</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
