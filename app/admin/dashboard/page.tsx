// app/admin/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { subDays, format } from "date-fns";
import type { FeeStatus } from "@prisma/client";

import { authOption } from "@/app/lib/auth";
import { db } from "@/lib/prisma";
import { AdminDashboard } from "@/app/components/AdminDashboard";
import StudentPasswordManager from "@/app/components/StudentPasswordManager";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOption);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const now = new Date();

  /* =======================
     Date Ranges
  ======================= */
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  );

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  /* =======================
     Parallel Queries
  ======================= */
  const [
    totalStudents,
    totalStaff,
    attendanceToday,
    monthlyRevenueAgg,
    recentStudents,

    feePaidAgg,
    feePartialAgg,
    feeOutstandingAgg,

    classesWithStudents,
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

    db.student.findMany({
      take: 5,
      orderBy: { admissionDate: "desc" },
    }),

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

    // 👇 Class-wise students
    db.class.findMany({
      select: {
        name: true,
        _count: {
          select: { students: true },
        },
      },
    }),
  ]);

  /* =======================
     Normalization
  ======================= */
  const monthlyRevenue = Number(monthlyRevenueAgg._sum.amount ?? 0);

  const paid = Number(feePaidAgg._sum?.amountPaid ?? 0);
  const pending = Number(feePartialAgg._sum?.amountPaid ?? 0);
  const overdue = Number(feeOutstandingAgg._sum?.remainAmount ?? 0);

  const totalExpected = paid + pending + overdue;
  const collectionRate =
    totalExpected > 0 ? Number(((paid / totalExpected) * 100).toFixed(1)) : 0;

  const feeStatus = {
    paid,
    pending,
    overdue,
    totalExpected,
    collectionRate,
  };

  const classWiseStudents = classesWithStudents.map((cls) => ({
    name: cls.name,
    studentCount: cls._count.students,
  }));

  /* =======================
     Attendance Trend (7 days)
  ======================= */
  const last7Days = Array.from({ length: 7 }).map((_, i) =>
    subDays(now, i)
  );

  const attendanceTrend = await Promise.all(
    last7Days.reverse().map(async (day) => {
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);

      const end = new Date(day);
      end.setHours(23, 59, 59, 999);

      const presentCount = await db.attendance.count({
        where: {
          date: { gte: start, lte: end },
          status: "PRESENT",
        },
      });

      const percentage = Math.round(
        (presentCount / Math.max(totalStudents, 1)) * 100
      );

      return {
        date: format(day, "MMM-dd"),
        percentage,
      };
    })
  );

  /* =======================
     Render
  ======================= */
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">
        Welcome {session.user.name}
      </h1>

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
        classWiseStudents={classWiseStudents}
      />

      <StudentPasswordManager />
    </div>
  );
}
