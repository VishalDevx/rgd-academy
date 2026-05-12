export type AppRole = "ADMIN" | "STAFF" | "STUDENT";

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export const sidebarItemsByRole: Record<AppRole, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
    { label: "Classes", href: "/admin/classes", icon: "class" },
    { label: "Students", href: "/admin/students", icon: "students" },
    { label: "Staff", href: "/admin/staff", icon: "staff" },
    { label: "Subjects", href: "/admin/subjects", icon: "subject" },
    { label: "Exams", href: "/admin/exams", icon: "exam" },
    { label: "Timetable", href: "/admin/date-sheet", icon: "DateSheet" },
    { label: "Results", href: "/admin/results", icon: "results" },
    { label: "Fees", href: "/admin/fees", icon: "fees" },
    { label: "Attendance", href: "/admin/attendance", icon: "attendance" },
    { label: "Announcements", href: "/admin/announcements", icon: "announce" },
    { label: "Expenses", href: "/admin/expenses", icon: "expense" },
    { label: "Settings", href: "/admin/settings", icon: "settings" },
    { label: "Logs", href: "/admin/logs", icon: "logs" },
  ],
STAFF: [
  { label: "Dashboard", href: "/staff/dashboard", icon: "dashboard" },
  { label: "My Classes", href: "/staff/classes", icon: "class" },
  { label: "Attendance", href: "/staff/attendance", icon: "attendance" },
  { label: "Exams", href: "/staff/exams", icon: "exam" },
  { label: "Results", href: "/staff/results", icon: "results" },
  { label: "Announcements", href: "/staff/announcements", icon: "announce" },
  { label: "Profile", href: "/staff/profile", icon: "user" },
],

STUDENT: [
  { label: "Dashboard", href: "/student/dashboard", icon: "dashboard" },
  { label: "Attendance", href: "/student/attendance", icon: "attendance" },
  { label: "Exams", href: "/student/exams", icon: "exam" },
  { label: "Results", href: "/student/results", icon: "results" },
  { label: "Fees", href: "/student/fees", icon: "fees" },
  { label: "Announcements", href: "/student/announcements", icon: "announce" },
  { label: "Profile", href: "/student/profile", icon: "user" },
]

};
