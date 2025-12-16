// app/admin/fees/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOption } from "@/app/lib/auth";
import { db } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

// UI Components
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";

// Charts
import { PaymentsTrendChart } from "@/app/components/charts/payments-trend-chart";
import { FeeStatusChart } from "@/app/components/charts/fee-status-chart";
import RecentPaymentsTable from "@/app/components/RecentPaymentsTable";
// --------------------------
// TYPES & HELPERS
// --------------------------
type FeeStructureRaw = {
  id: string;
  name: string | null;
  tuitionFee: Decimal;
  examFee: Decimal | null;
  transportFee: Decimal | null;
  miscFee: Decimal | null;
  total: Decimal;
  class: { id: string; name: string } | null;
};

type FeePaymentRaw = {
  id: string;
  createdAt: Date;
  status: "PAID" | "PARTIAL" | "UNPAID";
  amountPaid: Decimal;
  student: { id: string; user: { name: string; email: string } };
  feeStructure: { id: string; name: string | null };
};

interface FeeStructure {
  id: string;
  name: string | null;
  tuitionFee: number;
  examFee: number;
  transportFee: number;
  miscFee: number;
  total: number;
  className: string | null;
}

interface PaymentRecord {
  id: string;
  createdAt: Date;
  status: "PAID" | "PARTIAL" | "UNPAID";
  amountPaid: number;
  studentName: string;
  studentEmail: string;
  feeStructureName: string | null;
}

function toNumber(value: Decimal | number | null): number {
  if (value === null) return 0;
  return typeof value === "number" ? value : value.toNumber();
}

function normalizeStructure(raw: FeeStructureRaw): FeeStructure {
  return {
    id: raw.id,
    name: raw.name,
    tuitionFee: toNumber(raw.tuitionFee),
    examFee: toNumber(raw.examFee),
    transportFee: toNumber(raw.transportFee),
    miscFee: toNumber(raw.miscFee),
    total: toNumber(raw.total),
    className: raw.class?.name ?? null,
  };
}

function normalizePayment(raw: FeePaymentRaw): PaymentRecord {
  return {
    id: raw.id,
    createdAt: raw.createdAt,
    status: raw.status,
    amountPaid: toNumber(raw.amountPaid),
    studentName: raw.student.user.name,
    studentEmail: raw.student.user.email,
    feeStructureName: raw.feeStructure.name,
  };
}

// --------------------------
// PAGE
// --------------------------

export default async function AdminFeesPage() {
  const session = await getServerSession(authOption);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const [structuresRaw, paymentsRaw] = await Promise.all([
    db.feeStructure.findMany({ include: { class: true }, orderBy: { createdAt: "desc" } }) as Promise<FeeStructureRaw[]>,
    db.feePayment.findMany({ include: { student: { include: { user: true } }, feeStructure: true }, orderBy: { createdAt: "desc" }, take: 5 }) as Promise<FeePaymentRaw[]>,
  ]);

  const structures: FeeStructure[] = structuresRaw.map(normalizeStructure);
  const payments: PaymentRecord[] = paymentsRaw.map(normalizePayment);

  const totalExpected = structures.reduce((sum, s) => sum + s.total, 0);
  const totalPaidFull = payments.filter(p => p.status === "PAID").reduce((sum, p) => sum + p.amountPaid, 0);
  const totalPartial = payments.filter(p => p.status === "PARTIAL").reduce((sum, p) => sum + p.amountPaid, 0);
  const totalPaid = totalPaidFull + totalPartial;
  const totalOutstanding = Math.max(totalExpected - totalPaid, 0);
  const totalStudents = new Set(payments.map(p => p.studentName)).size;
  const totalStructures = structures.length;

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-6 bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">Fee Management</h1>
          <p className="text-sm text-muted-foreground">
            Oversee fee structures, track payments, and view analytics.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild><Link href="/admin/fees/structures/new">New Structure</Link></Button>
          <Button asChild variant="outline"><Link href="/admin/fees/payments/new">Record Payment</Link></Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xl rounded-xl">
          <CardHeader><CardTitle className="text-sm font-medium">Total Collected</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Full + Partial</p>
          </CardContent>
        </Card>
        <Card className="shadow-xl rounded-xl">
          <CardHeader><CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Remaining expected amount</p>
          </CardContent>
        </Card>
        <Card className="shadow-xl rounded-xl">
          <CardHeader><CardTitle className="text-sm font-medium">Total Students</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">With payments</p>
          </CardContent>
        </Card>
        <Card className="shadow-xl rounded-xl">
          <CardHeader><CardTitle className="text-sm font-medium">Fee Structures</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStructures}</div>
            <p className="text-xs text-muted-foreground">Active structures</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle>Fee Status Overview</CardTitle>
            <CardDescription>Paid vs Partial vs Outstanding</CardDescription>
          </CardHeader>
          <CardContent>
            <FeeStatusChart paid={totalPaidFull} partial={totalPartial} outstanding={totalOutstanding} />
          </CardContent>
        </Card>
        <Card className="shadow-xl rounded-xl h-full">
          <CardHeader>
            <CardTitle>Recent Payment Trends</CardTitle>
            <CardDescription>Last 5 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentsTrendChart payments={payments.map(p => ({
              id: p.id,
              amountPaid: p.amountPaid,
              createdAt: p.createdAt,
              status: p.status === "UNPAID" ? "PENDING" : p.status,
              studentName: p.studentName,
            }))} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments Table */}
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Payments</CardTitle>
            <Link href="/admin/fees/payments" className="text-sm font-medium text-blue-600 hover:underline">View all</Link>
          </div>
        </CardHeader>
        <CardContent>
          <RecentPaymentsTable payments={payments} />
        </CardContent>
      </Card>
    </div>
  );
}
