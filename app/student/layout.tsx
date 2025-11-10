// app/admin/layout.tsx
import { redirect } from "next/navigation";
import { authConfig } from "../api/auth/[...nextauth]/route";
import getServerSession from "next-auth";
import type { Session } from "next-auth";
import { Sidebar } from "../components/Sidebar";
import { StudentAuthGuard } from "../components/StudentAuthGuard";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentAuthGuard>
      <div className="flex h-screen">
        <Sidebar role="STAFF" />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </StudentAuthGuard>
  );
}
