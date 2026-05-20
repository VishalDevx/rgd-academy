import { db } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"
import { Badge } from "@/app/components/ui/badge"
import { Building2, CreditCard, IndianRupee, Users } from "lucide-react"

const statusBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  TRIALING: "secondary",
  REGISTERED: "outline",
  SUSPENDED: "destructive",
  CANCELLED: "destructive",
  EXPIRED: "destructive",
  PAST_DUE: "destructive",
}

export default async function PlatformDashboardPage() {
  const [
    totalSchools,
    activeSubscriptions,
    totalRevenueResult,
    trialSchools,
    recentSchools,
    planDistribution,
  ] = await Promise.all([
    db.organization.count(),
    db.subscription.count({ where: { status: "ACTIVE" } }),
    db.saasPayment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    db.organization.count({ where: { status: "TRIALING" } }),
    db.organization.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { subscriptions: { include: { plan: true }, take: 1 } },
    }),
    db.plan.findMany({
      include: { _count: { select: { subscriptions: true } } },
      orderBy: { sortOrder: "asc" },
    }),
  ])

  const totalRevenue = totalRevenueResult._sum.amount ?? 0

  const stats = [
    { label: "Total Schools", value: totalSchools, icon: Building2 },
    { label: "Active Subscriptions", value: activeSubscriptions, icon: CreditCard },
    { label: "Total Revenue", value: `₹${(totalRevenue / 100).toLocaleString()}`, icon: IndianRupee },
    { label: "Trial Schools", value: trialSchools, icon: Users },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of all schools and platform metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSchools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant[school.status] ?? "outline"}>
                        {school.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{school.subscriptions[0]?.plan.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {school.createdAt.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {recentSchools.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No schools registered yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Subscriptions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planDistribution.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="text-muted-foreground">{plan.code}</TableCell>
                    <TableCell>
                      {plan.priceMonthly === 0 ? "Free" : `₹${plan.priceMonthly.toLocaleString()}/mo`}
                    </TableCell>
                    <TableCell>{plan._count.subscriptions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
