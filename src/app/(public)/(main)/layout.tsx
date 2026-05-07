import MainLayout from "@/components/layout/MainLayout";

export default function PublicMainLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>;
}
