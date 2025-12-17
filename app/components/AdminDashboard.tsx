"use client";

import type { Student } from "@prisma/client";
import { motion } from "framer-motion";
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

export interface AdminDashboardProps {
  stats: {
    totalStudents: number;
    totalStaff: number;
    attandanceToday: number;
  };
  monthlyRevenue: { amount: number };
  recentStudents: Student[];
  attendanceTrend: { date: string; percentage: number }[];
  feeStatus: {
    paid: number;
    pending: number;
    overdue: number;
    collectionRate: number;
    totalExpected: number;
  };
  classWiseStudents: { name: string; studentCount: number }[];
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
    <div className="space-y-10 p-6">

      {/* =======================
         Top Stats
      ======================= */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Total Staff"
          value={stats.totalStaff}
          icon={UserCheck}
          gradient="from-emerald-500 to-green-500"
        />
        <StatCard
          title="Attendance Today"
          value={`${stats.attandanceToday}%`}
          icon={Layers}
          gradient="from-violet-500 to-purple-500"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${monthlyRevenue.amount}`}
          icon={IndianRupee}
          gradient="from-rose-500 to-red-500"
        />
      </div>

      {/* =======================
         Charts Section
      ======================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-4 shadow-lg">
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceTrendCharts data={attendanceTrend} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle>Fee Status</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrentMonthFeeStatusChart {...feeStatus} />
          </CardContent>
        </Card>
      </div>

      {/* =======================
         Distribution + Recent
      ======================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>Class-wise Student Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ClassWiseCharts data={classWiseStudents} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Recently Added
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No students added recently.
              </p>
            ) : (
              <ul className="space-y-3">
                {recentStudents.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium">{s.admissionNo}</p>
                      <p className="text-xs text-muted-foreground">
                        Roll: {s.rollNumber}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* =======================
   Stat Card
======================= */

function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  gradient: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="relative overflow-hidden shadow-lg">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`}
        />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
