// app/admin/layout.tsx
import { redirect } from "next/navigation";
import { authConfig } from "../api/auth/[...nextauth]/route";
import getServerSession from "next-auth";

import { Sidebar } from "../components/Sidebar";
import { AdminAuthGuard } from "../components/AdminAuthGuard";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="flex h-screen">
        <Sidebar role="ADMIN" />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </AdminAuthGuard>
  );
}



