"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/app/components/ui/select";

import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/app/components/ui/table";

interface Staff {
  id: string;
  staffId: string | null;
  designation: string;
  user: { name: string; email: string };
}

interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  status: string;
  staff: Staff;
}

interface MonthlyReport {
  month: number;
  year: number;
  total: number;
  counts: Record<string, number>;
  percentage: number;
}

const STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE", "HALF_DAY"] as const;

export default function AdminStaffAttendancePage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [reportMonth, setReportMonth] = useState(String(new Date().getMonth() + 1));
  const [reportYear, setReportYear] = useState(String(new Date().getFullYear()));
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const loadStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      const json = await res.json();
      if (json.success) setStaffList(json.data || []);
      else toast.error("Failed to load staff");
    } catch {
      toast.error("Failed to load staff");
    }
  };

  const loadAttendance = async (date: string) => {
    try {
      const res = await fetch(`/api/staff-attendance?date=${date}`);
      const json = await res.json();
      if (!json.success) throw new Error("Failed to load");
      const records = json.data as AttendanceRecord[];
      const map: Record<string, string> = {};
      records.forEach((r) => {
        map[r.staffId] = r.status;
      });
      setAttendance(map);
    } catch {
      toast.error("Failed to load attendance");
    }
  };

  const loadReport = async () => {
    setReportLoading(true);
    try {
      const res = await fetch(
        `/api/staff-attendance/report?month=${reportMonth}&year=${reportYear}`
      );
      const json = await res.json();
      if (json.success) setReport(json.data);
    } catch {
      toast.error("Failed to load report");
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      setLoading(true);
      await loadStaff();
      await loadAttendance(selectedDate);
      setLoading(false);
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadAttendance(selectedDate);
  }, [selectedDate]);

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const results = await Promise.all(
        staffList.map((staff) =>
          fetch("/api/staff-attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              staffId: staff.id,
              date: selectedDate,
              status: attendance[staff.id] || "PRESENT",
            }),
          })
        )
      );
      const allOk = results.every((r) => r.ok);
      if (allOk) {
        toast.success("Attendance saved successfully!");
      } else {
        toast.error("Some records failed to save");
      }
    } catch {
      toast.error("Error saving attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Staff Attendance</h1>

      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label>Date</Label>
              <input
                type="date"
                className="border rounded px-2 py-1 w-full"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <Button onClick={saveAttendance} disabled={saving}>
              {saving ? "Saving..." : "Save All Attendance"}
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading staff...</div>
          ) : staffList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No staff found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.user.name}</TableCell>
                    <TableCell>{staff.designation}</TableCell>
                    <TableCell className="w-[200px]">
                      <Select
                        value={attendance[staff.id] || "PRESENT"}
                        onValueChange={(val) =>
                          setAttendance((prev) => ({ ...prev, [staff.id]: val }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="min-w-[150px]">
              <Label>Month</Label>
              <Select value={reportMonth} onValueChange={setReportMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[150px]">
              <Label>Year</Label>
              <Select value={reportYear} onValueChange={setReportYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const y = new Date().getFullYear() - 2 + i;
                    return (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={loadReport} disabled={reportLoading}>
              {reportLoading ? "Loading..." : "View Report"}
            </Button>
          </div>

          {report && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="border rounded p-3 text-center">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{report.total}</p>
              </div>
              <div className="border rounded p-3 text-center">
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-600">{report.counts.PRESENT}</p>
              </div>
              <div className="border rounded p-3 text-center">
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-600">{report.counts.ABSENT}</p>
              </div>
              <div className="border rounded p-3 text-center">
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-yellow-600">{report.counts.LATE}</p>
              </div>
              <div className="border rounded p-3 text-center">
                <p className="text-sm text-muted-foreground">Leave</p>
                <p className="text-2xl font-bold text-blue-600">{report.counts.LEAVE}</p>
              </div>
              <div className="border rounded p-3 text-center">
                <p className="text-sm text-muted-foreground">Half Day</p>
                <p className="text-2xl font-bold text-orange-600">{report.counts.HALF_DAY}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
