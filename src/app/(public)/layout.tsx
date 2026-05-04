import MainLayout from "@/components/layout/MainLayout";

/**
 * Public layout wrapper that wraps all public-facing pages with the shared MainLayout chrome.
 */
export default function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>;
}