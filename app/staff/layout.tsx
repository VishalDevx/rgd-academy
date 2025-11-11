"use client";

import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { StaffAuthGuard } from "../components/StaffAuthGuard";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => setCollapsed((prev) => !prev);

  return (
    <StaffAuthGuard>
      <div className="flex h-screen">
        <Sidebar
          role="STAFF"
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
    </StaffAuthGuard>
  );
}
