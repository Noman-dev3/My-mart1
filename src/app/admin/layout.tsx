
'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';

// The main layout is now controlled by the RoleGate on each page.
// This layout file only handles routes that should have no admin UI at all.

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages that do not use any admin layout
  const plainLayoutRoutes = ['/admin/store-manager/print-bill'];
  if (plainLayoutRoutes.includes(pathname)) {
    return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
  }
  
  // For all other admin routes, the page itself (wrapped in RoleGate) will define the layout.
  // This allows the RoleGate to prevent the sidebar/header from rendering before authentication.
  return <>{children}</>;
}
