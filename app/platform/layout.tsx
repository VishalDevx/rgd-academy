import Link from "next/link"
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  CreditCard,
  Receipt,
} from "lucide-react"

const navItems = [
  { label: "Platform Dashboard", href: "/platform", icon: LayoutDashboard },
  { label: "Schools", href: "/platform/schools", icon: Building2 },
  { label: "Plans", href: "/platform/plans", icon: ClipboardList },
  { label: "Subscriptions", href: "/platform/subscriptions", icon: CreditCard },
  { label: "Payments", href: "/platform/payments", icon: Receipt },
]

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-lg font-bold tracking-tight">Super Admin</h1>
          <p className="text-sm text-muted-foreground">School Management</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
