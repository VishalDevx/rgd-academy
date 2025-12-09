"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { toast } from "sonner";

interface Student {
  id: string;
  admissionNo: string;
  rollNumber: string;
  admissionDate: string;
  dob: string;
  user: { name: string; email: string };
  classId: string;
}

export default function AdminAttendancePage() {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const loadClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const json = await res.json();

      console.log("CLASSES RAW:", json);

      if (!Array.isArray(json?.data)) {
        toast.error("Invalid classes response");
        return;
      }

      setClasses(json.data);
    } catch {
      toast.error("Failed to load classes");
    }
  };

  const loadStudents = async (classId: string) => {
    try {
      const res = await fetch(`/api/students?classId=${classId}`);
      const json = await res.json();

      console.log("STUDENTS API RAW:", json);

      if (!Array.isArray(json?.data)) {
        toast.error("Invalid students response");
        return;
      }

      const list = json.data as Student[];
      setStudents(list);

      const initial: Record<string, string> = {};
      list.forEach((s) => (initial[s.id] = "PRESENT"));
      setRecords(initial);
    } catch {
      toast.error("Failed to load students");
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    loadStudents(selectedClass);
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

      if (!res.ok) throw new Error("Failed to save attendance");

      toast.success("Attendance saved successfully!");
    } catch (err) {
      toast.error("Error saving attendance");
    } finally {
      setSaving(false);
    }
  };

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

            <Button onClick={submitAttendance} disabled={saving || !selectedClass}>
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
