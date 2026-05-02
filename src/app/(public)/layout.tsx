import MainLayout from "@/components/layout/MainLayout";

export default function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>;
}
