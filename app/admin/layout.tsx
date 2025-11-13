"use client";

import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { AdminAuthGuard } from "../components/AdminAuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => setCollapsed((prev) => !prev);

  return (
    <AdminAuthGuard>
      <div className="flex w-full min-h-screen bg-gray-50">
        {/* Sticky Sidebar */}
        <div
          className={`${
            collapsed ? "w-20" : "w-64"
          } sticky top-0 h-screen transition-all duration-300 z-50`}
        >
          <Sidebar role="ADMIN" collapsed={collapsed} onToggleCollapsed={handleToggle} />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  );
}
