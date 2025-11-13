import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/prisma";

// Shadcn UI Components
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

// Charts
import { PaymentsTrendChart } from "@/app/components/charts/payments-trend-chart";
import { FeeStatusChart } from "@/app/components/charts/fee-status-chart";

export default async function AdminFeesPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all data in parallel
  const [structures, paymentsRaw, totalCollectedResult] = await Promise.all([
    db.feeStructure.findMany({
      include: { class: true },
      orderBy: { createdAt: "desc" },
    }),
    db.feePayment.findMany({
      include: { student: { include: { user: true } }, feeStructure: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.feePayment.aggregate({ _sum: { amountPaid: true } }),
  ]);

  // Convert Decimal to number for charts and tables
  const payments = paymentsRaw.map((p) => ({
    ...p,
    amountPaid: Number(p.amountPaid),
  }));

  // Metrics
  const totalPaid = Number(totalCollectedResult._sum.amountPaid ?? 0);
  const totalExpected = structures.reduce((sum, s) => sum + Number(s.total), 0);
  const outstandingFees = totalExpected - totalPaid;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
          <p className="text-sm text-muted-foreground">
            Oversee fee structures, track payments, and view analytics.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/admin/fees/structures/new">New Structure</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/fees/payments/new">Record Payment</Link>
          </Button>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <svg /* Dollar Icon */></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
            <svg /* Credit Card Icon */></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{outstandingFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all structures</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fee Status Overview</CardTitle>
            <CardDescription>Collected vs. Outstanding fees.</CardDescription>
          </CardHeader>
          <CardContent>
            <FeeStatusChart paid={totalPaid} outstanding={outstandingFees} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payment Trends</CardTitle>
            <CardDescription>Last 5 payments.</CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentsTrendChart payments={payments} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Payments</CardTitle>
            <Link
              href="/admin/fees/payments"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="hidden sm:table-cell">Fee Structure</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.student.user.name}</div>
                    <div className="text-sm text-muted-foreground hidden md:inline">
                      {p.student.user.email}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{p.feeStructure.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">₹{p.amountPaid.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                  <Badge variant={p.status === "PAID" ? "secondary" : "destructive"}>
  {p.status}
</Badge>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
