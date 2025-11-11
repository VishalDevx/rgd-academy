"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarItemsByRole, type AppRole, type NavItem } from "@/app/config/sidebarItem";
import {
  ChevronLeft,
  ChevronRight,
  School,
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Wallet,
  CalendarCheck,
  Megaphone,
  FileText,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  role: AppRole;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

// Map icon strings → actual Lucide icons
const icons = {
  dashboard: LayoutDashboard,
  students: Users,
  staff: GraduationCap,
  class: BookOpen,
  fees: Wallet,
  attendance: CalendarCheck,
  announce: Megaphone,
  expense: FileText,
  exams: ClipboardList,
    exam: ClipboardList,
     results: BarChart3,
};

export function Sidebar({ role, collapsed = false, onToggleCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const items: NavItem[] = sidebarItemsByRole[role] ?? [];

  return (
    <aside
      className={`h-screen border-r bg-white shadow-sm flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <School size={20} />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-gray-800 tracking-tight">
              RGD School
            </span>
          )}
        </div>
        <button
          onClick={onToggleCollapsed}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-2">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = icons[item.icon as keyof typeof icons]; // pick mapped icon

            return (
              <motion.li
                key={item.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-sm transition-all ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {/* Icon */}
                  {Icon && (
                    <Icon
                      size={18}
                      className={`${active ? "text-white" : "text-blue-500"}`}
                    />
                  )}

                  {/* Label */}
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t text-xs text-gray-400 text-center">
        {!collapsed ? "© 2025 RGD School" : "©"}
      </div>
    </aside>
  );
}
