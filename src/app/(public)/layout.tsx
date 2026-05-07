"use client";

import { usePathname } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";

/**
 * Public layout wrapper that wraps all public-facing pages with the shared MainLayout chrome.
 */
export default function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isPatientAppRoute = ["/patient-dashboard", "/order", "/tracking"].some((route) =>
    pathname?.startsWith(route)
  );

  if (isPatientAppRoute) {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}
