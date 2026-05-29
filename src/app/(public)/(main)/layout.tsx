import React from 'react';

/**
 * PublicMainLayout wraps the main public pages (landing, signup, etc.).
 * The landing page has its own Navbar and Footer, so no shared wrapper is needed.
 */
export default function PublicMainLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
