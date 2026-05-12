"use client";

import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  TrendingUp,
} from "lucide-react";
import { PDFDownloadButton } from "@/app/components/PDFDownloadButton";
import { usePDF } from "@/app/lib/usePDF";
import { AttendanceReportPDF } from "@/app/components/PDFTemplates";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface AttendanceRecord {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE";
  markedBy: {
    user: {
      name: string;
    };
  };
  class: {
    name: string;
    grade: string;
    section: string | null;
  };
}

interface AttendanceData {
  attendance: AttendanceRecord[];
  stats: {
    total: number;
    present: number;
    absent: number;
    late: number;
    leave: number;
    percentage: number;
  };
  monthlyStats: {
    month: string;
    present: number;
    total: number;
    percentage: number;
  }[];
  student: {
    id: string;
    admissionNo: string;
    rollNumber: string;
    class: {
      name: string;
      grade: string;
      section: string | null;
    } | null;
  };
}

export default function StudentAttendancePage() {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const attendancePdf = usePDF("Attendance_Report.pdf");

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const res = await fetch(
          `/api/student/attendance?month=${selectedMonth}&year=${selectedYear}`
        );
        if (res.ok) {
          const attendanceData = await res.json();
          setData(attendanceData);
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Failed to load attendance data</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "ABSENT":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "LATE":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "LEAVE":
        return <FileText className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Present
          </Badge>
        );
      case "ABSENT":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Absent
          </Badge>
        );
      case "LATE":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            Late
          </Badge>
        );
      case "LEAVE":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Leave
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Generate calendar view
  const currentMonth = new Date(selectedYear, selectedMonth - 1);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const attendanceMap = new Map(
    data.attendance.map((a) => [
      format(new Date(a.date), "yyyy-MM-dd"),
      a.status,
    ])
  );

  return (
    <div className="space-y-6">
      {/* Hidden PDF content */}
      <div className="hidden"><div ref={attendancePdf.ref}>
        <AttendanceReportPDF
          studentName={data.student.class ? `${data.student.class.name} - Roll No: ${data.student.rollNumber}` : "Student"}
          className={data.student.class?.name ?? ""}
          month={format(new Date(selectedYear, selectedMonth - 1), "MMMM")}
          year={selectedYear.toString()}
          stats={data.stats}
          records={data.attendance.map(a => ({ date: format(new Date(a.date), "MMM dd, yyyy"), status: a.status }))}
        />
      </div></div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
          <p className="text-gray-500 mt-1">
            {data.student.class
              ? `${data.student.class.name} - Roll No: ${data.student.rollNumber}`
              : "View your attendance records"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PDFDownloadButton onClick={attendancePdf.generatePDF} loading={attendancePdf.loading} label="Download Report" variant="outline" />
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <SelectItem key={month} value={month.toString()}>
                  {format(new Date(selectedYear, month - 1), "MMMM")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Attendance %
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.percentage}%</div>
            <p className="text-xs text-gray-500 mt-1">
              {data.stats.present} / {data.stats.total} days
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${data.stats.percentage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Present
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.stats.present}
            </div>
            <p className="text-xs text-gray-500 mt-1">Days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Absent
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.stats.absent}
            </div>
            <p className="text-xs text-gray-500 mt-1">Days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Late
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data.stats.late}
            </div>
            <p className="text-xs text-gray-500 mt-1">Days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Leave
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.stats.leave}
            </div>
            <p className="text-xs text-gray-500 mt-1">Days</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Calendar View - {format(currentMonth, "MMMM yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
            {daysInMonth.map((day) => {
              const dayKey = format(day, "yyyy-MM-dd");
              const status = attendanceMap.get(dayKey);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={dayKey}
                  className={`aspect-square border rounded-lg p-2 flex flex-col items-center justify-center ${
                    isToday ? "ring-2 ring-blue-500" : ""
                  } ${
                    status === "PRESENT"
                      ? "bg-green-50 border-green-200"
                      : status === "ABSENT"
                      ? "bg-red-50 border-red-200"
                      : status === "LATE"
                      ? "bg-yellow-50 border-yellow-200"
                      : status === "LEAVE"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <span className="text-sm font-medium">{format(day, "d")}</span>
                  {status && (
                    <span className="text-xs mt-1">
                      {getStatusIcon(status)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
              <span>Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
              <span>Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
              <span>Leave</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {data.attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Marked By
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Class
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.attendance.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900">
                          {format(new Date(record.date), "MMM dd, yyyy")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(record.date), "EEEE")}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.status)}
                          {getStatusBadge(record.status)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {record.markedBy.user.name}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {record.class.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No attendance records for this month</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
