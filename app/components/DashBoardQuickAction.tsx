"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  UserPlus,
  BookOpen,
  Wallet,
  Megaphone,
} from "lucide-react";

const actions = [
  {
    title: "Add Student",
    slogan: "Register a new admission",
    href: "/admin/students/new",
    icon: UserPlus,
    gradient: "from-blue-600 via-cyan-500 to-sky-400",
  },
  {
    title: "Add Class",
    slogan: "Create academic section",
    href: "/admin/classes/new",
    icon: BookOpen,
    gradient: "from-emerald-600 via-green-500 to-lime-400",
  },
  {
    title: "Add Expense",
    slogan: "Record school spending",
    href: "/admin/expenses/new",
    icon: Wallet,
    gradient: "from-rose-600 via-red-500 to-orange-400",
  },
  {
    title: "Announcement",
    slogan: "Notify students & staff",
    href: "/admin/announcements/new",
    icon: Megaphone,
    gradient: "from-violet-600 via-purple-500 to-fuchsia-400",
  },
];

export function DashBoardQuickAction() {
  return (
    /* 50% width */
    <div >
      {/* one row */}
      <div className="flex gap-6">
        {actions.map((action) => (
          <motion.div
            key={action.title}
            className="flex-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            <Link
              href={action.href}
              className={`
                relative flex h-20 flex-col justify-center
                rounded-2xl bg-gradient-to-br ${action.gradient}
                px-4 text-white
                shadow-lg hover:shadow-2xl transition
              `}
            >
              {/* Top row: icon + title */}
              <div className="flex items-center gap-2">
                <action.icon className="h-7 w-7 shrink-0" />
                <span className="text-base font-semibold">
                  {action.title}
                </span>
              </div>

              {/* Bottom slogan */}
              <span className="mt-1 text-xs text-white/80 leading-tight">
                {action.slogan}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
