import { AdminLayoutClient } from "@/features/admin/admin-layout-client";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
