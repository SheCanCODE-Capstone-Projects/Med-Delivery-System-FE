/**
 * PublicLayout serves as a root wrapper for all public-facing routes.
 * It currently acts as a pass-through allowing nested route groups to define
 * their own structural layouts.
 * 
 * @param children - The child components rendered within the public route structure.
 * @returns A fragment containing the children.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <>{children}</>;
}
