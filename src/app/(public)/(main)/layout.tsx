import React from 'react';
import MainLayout from "@/components/layout/MainLayout";

/**
 * PublicMainLayout wraps the main public pages (landing, signup, etc.) with the
 * generic MainLayout header and footer.
 * 
 * @param children - The page content.
 * @returns The layout wrapper.
 */
export default function PublicMainLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>;
}
