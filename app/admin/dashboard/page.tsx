// app/admin/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import StudentPasswordManager from "@/app/components/StudentPasswordManager";
import { authOption } from "@/app/lib/auth";
import { AdminDashboard } from "@/app/components/AdminDashboard";
import { db } from "@/lib/prisma";
import { subDays, format } from "date-fns";
import type { FeeStatus } from "@prisma/client"; // enum type

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOption);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const now = new Date();

  // --- Dates ---
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // --- Fetch main stats and recent students ---
  const [
    totalStudents,
    totalStaff,
    attendanceToday,
    monthlyRevenueAggregate,
    recentStudents,
    feePaidAgg,
    feePartialAgg,
    feeOutstandingAgg,
  ] = await Promise.all([
    db.student.count(),
    db.staff.count(),
    db.attendance.count({
      where: { date: { gte: startOfToday, lte: endOfToday } },
    }),
    db.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
    }),
    db.student.findMany({ take: 5, orderBy: { admissionDate: "desc" } }),

    // Fee aggregates
    db.feePayment.aggregate({
      _sum: { amountPaid: true },
      where: { status: ("PAID" as unknown) as FeeStatus },
    }),
    db.feePayment.aggregate({
      _sum: { amountPaid: true },
      where: { status: ("PARTIAL" as unknown) as FeeStatus },
    }),
    db.feePayment.aggregate({
      _sum: { remainAmount: true },
      where: { remainAmount: { gt: 0 } },
    }),
  ]);

  // --- Convert Decimal -> number ---
  const monthlyRevenue = Number(monthlyRevenueAggregate._sum.amount ?? 0);

  const totalExpected =
    Number(feePaidAgg._sum?.amountPaid ?? 0) +
    Number(feePartialAgg._sum?.amountPaid ?? 0) +
    Number(feeOutstandingAgg._sum?.remainAmount ?? 0);

  const paid = Number(feePaidAgg._sum?.amountPaid ?? 0);
  const pending = Number(feePartialAgg._sum?.amountPaid ?? 0);
  const overdue = Number(feeOutstandingAgg._sum?.remainAmount ?? 0);
  const collectionRate = totalExpected > 0 ? +(paid / totalExpected * 100).toFixed(1) : 0;

  const feeStatus = {
    paid,
    pending,
    overdue,
    collectionRate,
    totalExpected,
  };

  // --- Attendance Trend (last 7 days) ---
  const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(now, i));

  const attendanceTrend = await Promise.all(
    last7Days.reverse().map(async (day) => {
      const d = new Date(day);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));

      const presentCount = await db.attendance.count({
        where: { date: { gte: start, lte: end }, status: "PRESENT" },
      });

      const totalCount = totalStudents || 1;
      const percentage = Math.round((presentCount / totalCount) * 100);

      return { date: format(d, "MMM-dd"), percentage };
    })
  );

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Welcome {session.user.name}</h1>

      <AdminDashboard
        stats={{
          totalStudents,
          totalStaff,
          attandanceToday: attendanceToday,
        }}
        monthlyRevenue={{ amount: monthlyRevenue }}
        recentStudents={recentStudents}
        attendanceTrend={attendanceTrend}
        feeStatus={feeStatus}
      />

      <StudentPasswordManager />
    </div>
  );
}
