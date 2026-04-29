import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedDelivery Auth",
  description: "Modern login experience for MedDelivery users."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
