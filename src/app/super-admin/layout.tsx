import React from 'react';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';

export default function SuperAdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperAdminLayout>
      {children}
    </SuperAdminLayout>
  );
}
