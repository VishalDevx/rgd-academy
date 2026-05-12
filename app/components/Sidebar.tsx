"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarItemsByRole, type AppRole, type NavItem } from "@/app/config/sidebarItem";
import {
  ChevronLeft,
  ChevronRight,
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
  TriangleRight,
  Settings,
  LogsIcon,
  UserRoundPen,
  CalendarCheck2,
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

const icons: Record<string, React.ComponentType<{ size?: number }>> = {
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
  settings: Settings,
  logs: LogsIcon,
  user: UserRoundPen,
  subject: TriangleRight,
  DateSheet: CalendarCheck2,
};

export function Sidebar({ role, collapsed = false, onToggleCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const items: NavItem[] = sidebarItemsByRole[role] ?? [];

  return (
    <aside
      className={cn(
        "h-screen flex flex-col border-r bg-gradient-to-b from-white/80 to-white/70 backdrop-blur-lg shadow-lg transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-md">
         <Link href="/admin/dashboard"><Image className="rounded-full" src="/logo.jpeg" width={40} height={40} alt="Logo" /></Link> 
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold tracking-wide">RGD School</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapsed}
          className="hover:bg-primary/10 hover:text-primary transition-all"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-2">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = icons[item.icon as keyof typeof icons];

            const linkContent = (
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/20 text-primary shadow-inner"
                    : "hover:bg-primary/10 hover:text-primary text-muted-foreground"
                )}
              >
                {Icon && <Icon size={18} />}
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
            );

            return (
              <motion.li
                key={item.href}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-md"
              >
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>{linkContent}</Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-gray-800 text-white rounded-md px-2 py-1 text-xs shadow-md">
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

      <div
        className={cn(
          "p-4 text-xs font-medium border-t border-gray-200 text-muted-foreground",
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
              className="underline hover:text-primary transition-colors"
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
