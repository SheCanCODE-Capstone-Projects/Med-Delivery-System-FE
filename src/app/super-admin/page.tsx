import { redirect } from 'next/navigation';

export default function SuperAdminPage() {
  // Redirect to the default dashboard view for super-admins
  redirect('/super-admin/analytics');
}
