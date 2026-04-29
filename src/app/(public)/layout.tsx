"use client";

import { usePathname } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";

export default function PublicLayout({ children }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return children;
  }

  return <MainLayout>{children}</MainLayout>;
}
