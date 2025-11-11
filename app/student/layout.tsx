"use client";

import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { StudentAuthGuard } from "../components/StudentAuthGuard";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => setCollapsed((prev) => !prev);

  return (
    <StudentAuthGuard>
      <div className="flex h-screen">
        <Sidebar
          role="STUDENT"
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
    </StudentAuthGuard>
  );
}
