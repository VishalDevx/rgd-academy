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

  Settings,
  LogsIcon,
  UserRoundPen
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { cn } from "../lib/utils";

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
  settings:Settings,
  logs:LogsIcon,
  user:UserRoundPen
};

export function Sidebar({ role, collapsed = false, onToggleCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const items: NavItem[] = sidebarItemsByRole[role] ?? [];

  return (
    <aside
      className={cn(
        "h-screen flex flex-col border-r bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40 transition-all duration-300 shadow-sm",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground shadow-md">
            <School size={20} />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold tracking-tight">RGD School</span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapsed}
          className="hover:bg-accent hover:text-accent-foreground"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-2">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = icons[item.icon as keyof typeof icons];

            const linkContent = (
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                )}
              >
                {Icon && <Icon size={18} />}
                {!collapsed && <span>{item.label}</span>}
              </div>
            );

            return (
              <motion.li key={item.href} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>{linkContent}</Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
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
  className={cn(
    "p-4 text-xs font-medium border-t text-muted-foreground",
    collapsed ? "text-center" : "text-left"
  )}
>
  {!collapsed ? (
    <span>
      © 2025 RGD School —{" "}
      <a
        href="https://github.com/VishalDevx"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-primary transition"
      >
        Built by Vishal
      </a>
    </span>
  ) : (
    "©"
  )}
</div>

    </aside>
  );
}
