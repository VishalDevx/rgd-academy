"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarItemsByRole, type AppRole, type NavItem } from "@/app/config/sidebarItem";

interface SidebarProps {
  role: AppRole;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export function Sidebar({ role, collapsed = false, onToggleCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const items: NavItem[] = sidebarItemsByRole[role] ?? [];

  return (
    <aside className={`h-screen border-r bg-white ${collapsed ? "w-16" : "w-64"}`}>
      <div className="flex items-center justify-between p-4 border-b">
        <span className="font-semibold">{collapsed ? "RGD" : "RGD School"}</span>
        <button
          type="button"
          className="text-sm text-gray-600 hover:text-black"
          onClick={onToggleCollapsed}
        >
          {collapsed ? ">>" : "<<"}
        </button>
      </div>
      <nav className="p-2">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded px-3 py-2 text-sm transition ${
                    active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {!collapsed ? item.label : item.label[0]}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
