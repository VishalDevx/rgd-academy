"use client"

import { Banknote, Users, Receipt, PieChart } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"

interface DashboardData {
  totalStructures: number
  totalPayments: number
  totalCollected: number
  pendingCount: number
  paidCount: number
  partialCount: number
  recentPayments: {
    id: string
    amountPaid: number
    status: string
    paymentDate: string | null
    receiptNo: string | null
    student: { user: { name: string | null }; class: { name: string } }
    feeStructure: { name: string | null }
  }[]
  monthlyData: { status: string; count: number; amount: number }[]
}

const statusStyles: Record<string, string> = {
  PAID: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  PARTIAL: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  PENDING: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string
  value: string
  icon: React.ElementType
  description?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function FeesDashboardClient({ data }: { data: DashboardData }) {
  const totalRecords = data.paidCount + data.partialCount + data.pendingCount
  const collectionRate =
    totalRecords > 0
      ? Math.round((data.paidCount / totalRecords) * 100)
      : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fee Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of fee collections and status
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Collected"
          value={`₹${data.totalCollected.toLocaleString()}`}
          icon={Banknote}
          description="Across all structures"
        />
        <StatCard
          title="Payment Records"
          value={data.totalPayments.toLocaleString()}
          icon={Receipt}
          description={`${data.totalStructures} fee structures`}
        />
        <StatCard
          title="Collection Rate"
          value={`${collectionRate}%`}
          icon={PieChart}
          description={`${data.paidCount} paid of ${totalRecords}`}
        />
        <StatCard
          title="Pending"
          value={data.pendingCount.toLocaleString()}
          icon={Users}
          description={`${data.partialCount} partial payments`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { status: "PAID", count: data.paidCount, amount: data.monthlyData.find((m) => m.status === "PAID")?.amount ?? 0 },
                { status: "PARTIAL", count: data.partialCount, amount: data.monthlyData.find((m) => m.status === "PARTIAL")?.amount ?? 0 },
                { status: "PENDING", count: data.pendingCount, amount: data.monthlyData.find((m) => m.status === "PENDING")?.amount ?? 0 },
              ].map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={statusStyles[item.status] ?? ""} variant="secondary">
                      {item.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{item.count} records</span>
                  </div>
                  <span className="text-sm font-medium">
                    ₹{item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Structure</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No payments yet
                    </TableCell>
                  </TableRow>
                ) : (
                  data.recentPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {p.student.user.name || "Unknown"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.feeStructure.name || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{p.amountPaid.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={statusStyles[p.status] ?? ""}
                          variant="secondary"
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
