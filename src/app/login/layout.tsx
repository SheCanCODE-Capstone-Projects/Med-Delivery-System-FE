import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MedDelivery Auth",
  description: "Modern login experience for MedDelivery users."
};

/**
 * Renders the standalone layout wrapper for the login route.
 */
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
