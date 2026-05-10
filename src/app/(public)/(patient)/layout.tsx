/**
 * PatientRouteLayout wraps all patient-related route groups.
 * Currently it acts as a simple pass-through fragment, allowing child routes
 * to render their own layout components like PatientAppShell independently.
 * 
 * @param children - The child components of the patient routes.
 * @returns A fragment containing the children.
 */
export default function PatientRouteLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
