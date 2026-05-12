import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { MoreVertical } from "lucide-react"; // Install lucide-react if you haven't

import { authOption } from "@/app/lib/auth";
import { db } from "@/lib/prisma";
import { AdminDashboard } from "@/app/components/AdminDashboard";
import { DashBoardQuickAction } from "@/app/components/DashBoardQuickAction";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOption);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Build last 7 days array
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
    return { label: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), dayStart, dayEnd };
  });

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
    latestAnnouncements,
    latestExpenses,
    latestExams,
    ...dailyAttendance
  ] = await Promise.all([
    db.student.count(),
    db.staff.count(),
    db.attendance.count({ where: { date: { gte: startOfToday, lte: endOfToday } } }),
    db.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: startOfMonth } } }),
    db.student.findMany({ take: 5, orderBy: { admissionDate: "desc" } }),
    db.feePayment.aggregate({ _sum: { amountPaid: true }, where: { status: "PAID" } }),
    db.feePayment.aggregate({ _sum: { amountPaid: true }, where: { status: "PARTIAL" } }),
    db.feePayment.aggregate({ _sum: { remainAmount: true }, where: { remainAmount: { gt: 0 } } }),
    db.class.findMany({ select: { name: true, _count: { select: { students: true } } } }),
    db.announcement.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    db.expense.findMany({ take: 5, orderBy: { date: "desc" } }),
    db.exam.findMany({ take: 5, orderBy: { startDate: "asc" }, include: { class: true } }),
    ...last7Days.map((d) =>
      Promise.all([
        db.attendance.count({ where: { date: { gte: d.dayStart, lte: d.dayEnd }, status: "PRESENT" } }),
        db.attendance.count({ where: { date: { gte: d.dayStart, lte: d.dayEnd } } }),
      ]).then(([present, total]) => ({
        date: d.label,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      }))
    ),
  ]);

  // Calculations (Simplified for brevity)
  const monthlyRevenue = Number(monthlyRevenueAgg._sum.amount ?? 0);
  const feeStatus = { 
    paid: Number(feePaidAgg._sum?.amountPaid ?? 0), 
    pending: Number(feePartialAgg._sum?.amountPaid ?? 0), 
    overdue: Number(feeOutstandingAgg._sum?.remainAmount ?? 0),
    totalExpected: 0, collectionRate: 0 
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold">Welcome {session.user.name}</h1>

      <AdminDashboard 
        stats={{ totalStudents, totalStaff, attandanceToday: attendanceToday }}
        monthlyRevenue={{ amount: monthlyRevenue }}
        recentStudents={recentStudents}
        attendanceTrend={dailyAttendance}
        feeStatus={feeStatus}
        classWiseStudents={classesWithStudents.map(c => ({ name: c.name, studentCount: c._count.students }))}
      />

      <DashBoardQuickAction />

      {/* Announcements Section (Full Width) */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">Latest Announcements</h2>
          <Link href="/admin/annoucements" className="text-sm font-medium text-blue-600 hover:text-blue-700">View all</Link>
        </div>
        <div className="space-y-4">
          {latestAnnouncements.map((a) => (
            <div key={a.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
              <div>
                <p className="font-medium text-gray-900">{a.title}</p>
                <p className="text-xs text-gray-500">{format(new Date(a.createdAt), "MMM dd, yyyy")}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={18} /></button>
            </div>
          ))}
        </div>
      </section>

      {/* Grid for Expenses and Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Recent Expenses</h2>
            <Link href="/admin/expense" className="text-sm font-medium text-blue-600 pointer">View all</Link>
          </div>
          <table className="w-full">
            <thead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              <tr className="border-b">
                <th className="text-left pb-3">Category</th>
                <th className="text-left pb-3">Amount</th>
                <th className="text-left pb-3">Date</th>
                <th className="text-left pb-3">Status</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {latestExpenses.map((e) => (
                <tr key={e.id} className="group border-b last:border-0 hover:bg-gray-50/50">
                  <td className="py-4">
                    <div className="font-medium text-gray-900">{e.title}</div>
                    <div className="text-xs text-gray-400">{e.transaction || "General"}</div>
                  </td>
                  <td className="py-4 font-semibold text-gray-700">₹{Number(e.amount).toLocaleString()}</td>
                  <td className="py-4 text-gray-500">{format(new Date(e.date), "yyyy-MM-dd")}</td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-green-100 text-green-700 uppercase">Paid</span>
                  </td>
                  <td className="py-4 text-right"><MoreVertical size={16} className="text-gray-300" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Upcoming Exams</h2>
            <Link  href="/admin/exams" className="text-sm font-medium text-blue-600 pointer">View all</Link>
          </div>
          <table className="w-full">
            <thead className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              <tr className="border-b">
                <th className="text-left pb-3">Subject</th>
                <th className="text-left pb-3">Class</th>
                <th className="text-left pb-3">Date</th>
                <th className="text-left pb-3">Time</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {latestExams.map((exam) => (
                <tr key={exam.id} className="border-b last:border-0 hover:bg-gray-50/50">
                  <td className="py-4">
                    <div className="font-medium text-gray-900">{exam.name}</div>
                    <div className="text-xs text-gray-400">{exam.class?.name || "N/A"}</div>
                  </td>
                  <td className="py-4 text-gray-600">Grade 10</td>
                  <td className="py-4 text-gray-500">{format(new Date(exam.startDate), "yyyy-MM-dd")}</td>
                  <td className="py-4 text-gray-700 font-medium">{format(new Date(exam.startDate), "hh:mm a")}</td>
                  <td className="py-4 text-right"><MoreVertical size={16} className="text-gray-300" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}