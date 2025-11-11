"use client";

import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { AdminAuthGuard } from "../components/AdminAuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => setCollapsed((prev) => !prev);

  return (
    <AdminAuthGuard>
      <div className="flex h-screen">
        <Sidebar
          role="ADMIN"
          collapsed={collapsed}
          onToggleCollapsed={handleToggle}
        />
        <main
          className={`flex-1 overflow-auto transition-all duration-300 ${
            collapsed ? "ml-20" : "ml-64"
          } p-6`}
        >
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  );
}
