import AdminLayout from "@/components/layouts/AdminLayout";

/**
 * Admin layout — all /admin/* routes share Navbar + AdminSidebar.
 * Auth check is handled client-side by AuthProvider in the root layout.
 */
export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
