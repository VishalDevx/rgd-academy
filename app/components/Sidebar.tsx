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
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";


interface SidebarProps {
  role: AppRole;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

// Icon mapping
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
      className={`h-screen flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      } bg-gradient-to-b from-blue-50 to-blue-100 shadow-lg border-r border-blue-200`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg shadow-lg">
            <School size={22} className="text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-blue-900 tracking-tight">RGD School</span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapsed}
          className="text-blue-600 hover:text-blue-800"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-3">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = icons[item.icon as keyof typeof icons];

            const linkContent = (
              <div
                className={`flex items-center gap-3 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  active
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-blue-700 hover:bg-blue-200 hover:text-blue-900"
                }`}
              >
                {Icon && <Icon size={20} />}
                {!collapsed && <span>{item.label}</span>}
              </div>
            );

            return (
              <motion.li
                key={item.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {collapsed ? (
                  <Tooltip>
  <TooltipTrigger asChild>
    <Link href={item.href}>{linkContent}</Link>
  </TooltipTrigger>
  <TooltipContent side="right">
    {item.label}
  </TooltipContent>
</Tooltip>

                ) : (
                  <Link href={item.href}>{linkContent}</Link>
                )}
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div
        className={`p-4 text-xs text-blue-700 font-semibold border-t border-blue-200 ${
          collapsed ? "text-center" : "text-left"
        }`}
      >
        {!collapsed ? "© 2025 RGD School" : "©"}
      </div>
    </aside>
  );
}
