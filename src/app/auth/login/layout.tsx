import type { ReactNode } from "react";

/**
 * LoginLayout serves as the layout boundary for the authentication pages.
 * 
 * @param children - The child components rendered within the layout.
 * @returns A fragment containing the children.
 */
export default function LoginLayout({
  children
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}