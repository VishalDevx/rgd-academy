"use client";

import { Student } from "@prisma/client";
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

export interface MonthlyRevenue {
  amount: number;
}

export interface AttendancePoint {
  date: string;
  percentage: number;
}

export interface AdminDashboardProps {
  stats: {
    totalStudents: number;
    totalStaff: number;
    attandanceToday: number;
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
}

export function AdminDashboard({
  stats,
  monthlyRevenue,
  recentStudents,
  attendanceTrend,
  feeStatus,
}: AdminDashboardProps) {
  return (
    <div className="p-6 space-y-8">

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-8 w-8 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalStudents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <UserCheck className="h-8 w-8 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalStaff}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attendance Today</CardTitle>
            <Layers className="h-8 w-8 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.attandanceToday}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <IndianRupee className="h-8 w-8 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{monthlyRevenue.amount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row → 80% + 20% */}
      <div className="flex gap-4 w-full">
        {/* Attendance Trend (80%) */}
        <div className="w-[80%]">
          <AttendanceTrendCharts data={attendanceTrend} />
        </div>

        {/* Fee Status Chart (20%) */}
        <div className="w-[30%]">
          <CurrentMonthFeeStatusChart
            paid={feeStatus.paid}
            pending={feeStatus.pending}
            overdue={feeStatus.overdue}
            collectionRate={feeStatus.collectionRate}
            totalExpected={feeStatus.totalExpected}
          />
        </div>
      </div>

      {/* Recently Added Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-8 w-8 text-blue-600" />
            Recently Added Students
          </CardTitle>
        </CardHeader>

        <CardContent>
          {recentStudents.length === 0 ? (
            <p className="text-sm text-gray-500">No recent students found.</p>
          ) : (
            <ul className="space-y-2">
              {recentStudents.map((s) => (
                <li
                  key={s.id}
                  className="p-2 bg-gray-100 rounded flex justify-between"
                >
                  <span className="font-medium">{s.admissionNo}</span>
                  <span className="text-sm text-gray-600">{s.rollNumber}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
