"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { toast } from "sonner";

interface Student {
  id: string;
  user: { name: string };
  classId: string;
}

export default function AdminAttendancePage() {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Fetch classes
  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => setClasses(data))
      .catch(() => toast.error("Failed to load classes"));
  }, []);

  // Fetch students when class changes
  useEffect(() => {
    if (!selectedClass) return;

    fetch(`/api/students?classId=${selectedClass}`)
      .then((res) => res.json())
      .then((data: Student[]) => {
        setStudents(data);
        const initialRecords: Record<string, string> = {};
        data.forEach((s) => (initialRecords[s.id] = "PRESENT"));
        setRecords(initialRecords);
      })
      .catch(() => toast.error("Failed to load students"));
  }, [selectedClass]);

  const setStatus = (studentId: string, status: string) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    if (!selectedClass) return;
    setSaving(true);

    const payload = {
      classId: selectedClass,
      date,
      records: students.map((s) => ({
        studentId: s.id,
        status: records[s.id] || "PRESENT",
      })),
    };
try {
  const res = await fetch("/api/attendance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to save attendance");
  }

  toast.success("Attendance saved successfully!");
} catch (err: unknown) {
  const message =
    err instanceof Error ? err.message : "Error saving attendance";

  toast.error(message);
} finally {
  setSaving(false);
}
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Attendance</h1>

      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <Label>Date</Label>
              <input
                type="date"
                className="border rounded px-2 py-1 w-full"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <Button
              onClick={submitAttendance}
              disabled={saving || !selectedClass}
              className="self-start"
            >
              {saving ? "Saving..." : "Save Attendance"}
            </Button>
          </div>

          {students.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 border text-left">Student</th>
                    <th className="p-2 border text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="p-2 border">{s.user.name}</td>
                      <td className="p-2 border">
                        <Select
                          value={records[s.id] || "PRESENT"}
                          onValueChange={(val) => setStatus(s.id, val)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRESENT">PRESENT</SelectItem>
                            <SelectItem value="ABSENT">ABSENT</SelectItem>
                            <SelectItem value="LATE">LATE</SelectItem>
                            <SelectItem value="LEAVE">LEAVE</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
