"use client";

import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { AdminAuthGuard } from "../components/AdminAuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => setCollapsed((prev) => !prev);

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen w-full bg-gray-50">
        <Sidebar
          role="ADMIN"
          collapsed={collapsed}
          onToggleCollapsed={handleToggle}
        />
        <main className="flex-1 overflow-auto p-6 transition-all duration-300">
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  );
}
