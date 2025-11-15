import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/prisma";

// UI Components
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

// Helpers
function normalizeStructure(s: any) {
  return {
    ...s,
    tuitionFee: Number(s.tuitionFee),
    examFee: Number(s.examFee),
    transportFee: Number(s.transportFee),
    miscFee: Number(s.miscFee),
    total: Number(s.total),
  };
}

function normalizePayment(p: any) {
  return {
    ...p,
    amountPaid: Number(p.amountPaid),
    feeStructure: normalizeStructure(p.feeStructure),
  };
}

export default async function AdminFeesPage() {
  const session = await getServerSession(authConfig);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  // Fetch DB data
  const [structuresRaw, paymentsRaw] = await Promise.all([
    db.feeStructure.findMany({
      include: { class: true },
      orderBy: { createdAt: "desc" },
    }),
    db.feePayment.findMany({
      include: { student: { include: { user: true } }, feeStructure: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const structures = structuresRaw.map(normalizeStructure);
  const payments = paymentsRaw.map(normalizePayment);

  // Total expected fee from all structures
  const totalExpected = structures.reduce((sum, s) => sum + s.total, 0);

  // Calculate totals by status
  const totalPaidFull = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const totalPartial = payments
    .filter((p) => p.status === "PARTIAL")
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const totalPaid = totalPaidFull + totalPartial;

  const totalOutstanding = Math.max(totalExpected - totalPaid, 0);

  const totalStudents = new Set(payments.map((p) => p.student.id)).size;
  const totalStructures = structures.length;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
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

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Full + Partial</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Remaining expected amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">With payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Fee Structures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStructures}</div>
            <p className="text-xs text-muted-foreground">Active structures</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fee Status Overview</CardTitle>
            <CardDescription>Paid vs Partial vs Outstanding</CardDescription>
          </CardHeader>

          <CardContent>
            <FeeStatusChart
              paid={totalPaidFull}
              partial={totalPartial}
              outstanding={totalOutstanding}
            />
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Recent Payment Trends</CardTitle>
            <CardDescription>Last 5 transactions</CardDescription>
          </CardHeader>

          <CardContent>
            <PaymentsTrendChart
              payments={payments.map((p) => ({
                id: p.id,
                amountPaid: p.amountPaid,
                createdAt: new Date(p.createdAt),
                status: p.status,
                studentName: p.student.user.name,
              }))}
            />
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
                <TableHead className="hidden sm:table-cell">Structure</TableHead>
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

                  <TableCell className="hidden sm:table-cell">
                    {p.feeStructure.name}
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-right">
                    ₹{p.amountPaid.toLocaleString()}
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      variant={
                        p.status === "PAID"
                          ? "secondary"
                          : p.status === "PARTIAL"
                          ? "outline"
                          : "destructive"
                      }
                    >
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
