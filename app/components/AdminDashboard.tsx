"use client";

import type { Student } from "@prisma/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Users,
  UserCheck,
  Layers,
  IndianRupee,
  UserPlus,
} from "lucide-react";

import AttendanceTrendCharts from "./charts/attendanceTrendCharts";
import { CurrentMonthFeeStatusChart } from "./charts/DashboardFeeCharts";
import ClassWiseCharts from "./charts/classWiseCharts";

/* =======================
   Types
======================= */

export interface MonthlyRevenue {
  amount: number;
}

export interface AttendancePoint {
  date: string;
  percentage: number;
}

export interface ClassWiseStudentCount {
  name: string;
  studentCount: number;
}

export interface AdminDashboardProps {
  stats: {
    totalStudents: number;
    totalStaff: number;
    attandanceToday: number; // backend typo – keep consistent
  };
  monthlyRevenue: MonthlyRevenue;
  recentStudents: Student[];
  attendanceTrend: AttendancePoint[];
  feeStatus: {
    paid: number;
    pending: number;
    overdue: number;
    collectionRate: number;
    totalExpected: number;
  };
  classWiseStudents: ClassWiseStudentCount[];
}

/* =======================
   Component
======================= */

export function AdminDashboard({
  stats,
  monthlyRevenue,
  recentStudents,
  attendanceTrend,
  feeStatus,
  classWiseStudents,
}: AdminDashboardProps) {
  return (
    <div className="space-y-8 p-6">

      {/* =======================
         Top Stats
      ======================= */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<Users className="h-7 w-7 text-blue-600" />}
        />
        <StatCard
          title="Total Staff"
          value={stats.totalStaff}
          icon={<UserCheck className="h-7 w-7 text-green-600" />}
        />
        <StatCard
          title="Attendance Today"
          value={`${stats.attandanceToday}%`}
          icon={<Layers className="h-7 w-7 text-purple-600" />}
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${monthlyRevenue.amount}`}
          icon={<IndianRupee className="h-7 w-7 text-red-600" />}
        />
      </div>

      {/* =======================
         Charts Section
      ======================= */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Attendance Trend → 4/5 */}
        <div className="lg:col-span-4">
          <AttendanceTrendCharts data={attendanceTrend} />
        </div>

        {/* Fee Status → 1/5 */}
        <div className="lg:col-span-1">
          <CurrentMonthFeeStatusChart
            paid={feeStatus.paid}
            pending={feeStatus.pending}
            overdue={feeStatus.overdue}
            collectionRate={feeStatus.collectionRate}
            totalExpected={feeStatus.totalExpected}
          />
        </div>
      </div>

      {/* =======================
         Class-wise Distribution
      ======================= */}
      <Card>
        <CardHeader>
          <CardTitle>Class-wise Student Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-1/2">

          <ClassWiseCharts data={classWiseStudents} />
          </div>
        </CardContent>
      </Card>

      {/* =======================
         Recent Students
      ======================= */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-blue-600" />
            Recently Added Students
          </CardTitle>
        </CardHeader>

        <CardContent>
          {recentStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recent students found.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentStudents.map((s) => (
                <li
                  key={s.id}
                  className="flex justify-between rounded-md bg-muted p-2"
                >
                  <span className="font-medium">{s.admissionNo}</span>
                  <span className="text-sm text-muted-foreground">
                    {s.rollNumber}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* =======================
   Small Reusable Component
======================= */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
