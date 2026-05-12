"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { usePDF } from "@/app/lib/usePDF";
import { format } from "date-fns";

interface Student {
  id: string;
  user: { name: string };
  classId: string;
}

export default function AdminAttendancePage() {
  const router = useRouter();

  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const reportPdf = usePDF(`Attendance_${date}.pdf`);
  const className = classes.find(c => c.id === selectedClass)?.name ?? "Class";

  // Load all classes
  const loadClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const json = await res.json();
      if (!Array.isArray(json?.data)) {
        toast.error("Invalid classes response");
        return;
      }
      setClasses(json.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load classes");
    }
  };

  // Load students of selected class
  const loadStudents = async (classId: string) => {
    try {
      const res = await fetch(`/api/students?classId=${classId}`); // removed trailing slash
      const json = await res.json();

      if (!Array.isArray(json?.data)) {
        toast.error("Invalid students response");
        return;
      }

      // Map students to expected shape
      const list: Student[] = json.data.map(
        (s: { id?: string; user?: { name?: string }; class?: { id?: string } }) => ({
          id: s.id ?? "",
          user: { name: s.user?.name ?? "No Name" },
          classId: s.class?.id ?? "",
        })
      );

      console.log("Loaded students:", list); // debug log

      setStudents(list);

      // Initialize attendance records
      const initial: Record<string, string> = {};
      list.forEach((s) => (initial[s.id] = "PRESENT"));
      setRecords(initial);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load students");
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) loadStudents(selectedClass);
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

      if (!res.ok) throw new Error(await res.text());

      toast.success("Attendance saved successfully!");
      router.push("/admin/attendance");
    } catch (err) {
      console.error(err);
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

          {/* Hidden PDF content */}
          <div className="hidden"><div ref={reportPdf.ref}>
            <div className="p-8 text-sm">
              <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-2xl font-bold">R. G. D. Academy</h1>
                <p className="text-xs text-gray-600">Bharapur Nagina, Distt. Bijnor (U.P.)</p>
                <p className="text-lg font-semibold mt-2">Attendance Report</p>
                <p className="text-sm">{className} - {date}</p>
              </div>
              <table className="w-full border">
                <thead><tr className="bg-gray-100">
                  <th className="border p-2 text-left">Student</th><th className="border p-2 text-left">Status</th>
                </tr></thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}><td className="border p-2">{s.user.name}</td><td className="border p-2">{records[s.id]}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-10 grid grid-cols-2 gap-10 text-xs">
                <div><div className="h-10 border-b mb-1" /><p className="text-center">Teacher Signature</p></div>
                <div><div className="h-10 border-b mb-1" /><p className="text-center">Principal</p></div>
              </div>
            </div>
          </div></div>

          {/* Class & Date */}
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
            {students.length > 0 && (
              <Button variant="outline" onClick={reportPdf.generatePDF} disabled={reportPdf.loading}>
                <Download className="h-4 w-4 mr-1" />
                {reportPdf.loading ? "..." : "Download Report"}
              </Button>
            )}
          </div>

          {/* Students Table */}
          {students.length > 0 ? (
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
                      <td className="p-2 border w-[180px]">
                        <Select
                          value={records[s.id]}
                          onValueChange={(val) => setStatus(s.id, val)}
                        >
                          <SelectTrigger>
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
          ) : selectedClass ? (
            <p>No students found for this class.</p>
          ) : null}

        </CardContent>
      </Card>
    </div>
  );
}
