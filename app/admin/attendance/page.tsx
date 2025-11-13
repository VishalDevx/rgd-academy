"use client";

import { useEffect, useState } from "react";

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
  const [message, setMessage] = useState("");

  // Fetch classes
  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => setClasses(data))
      .catch((err) => console.error("Failed to load classes", err));
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
      .catch((err) => console.error("Failed to load students", err));
  }, [selectedClass]);

  const setStatus = (studentId: string, status: string) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    if (!selectedClass) return;

    setSaving(true);
    setMessage("");

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
        credentials: "include", // ensure cookies are sent
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save attendance");

      setMessage("Attendance saved successfully!");
    } catch (err: any) {
      setMessage(err.message || "Error saving attendance");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Attendance</h1>

      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div>
          <label className="block mb-1 text-sm font-medium">Class</label>
          <select
            className="border rounded px-2 py-1"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Date</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <button
          className={`px-4 py-2 rounded text-white ${
            saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={submitAttendance}
          disabled={saving || !selectedClass}
        >
          {saving ? "Saving..." : "Save Attendance"}
        </button>
      </div>

      {message && <p className="text-sm text-green-600 mb-3">{message}</p>}

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full border text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Student</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td className="p-2 border">{s.user.name}</td>
                <td className="p-2 border">
                  <select
                    className="border px-1 py-0.5 rounded"
                    value={records[s.id] || "PRESENT"}
                    onChange={(e) => setStatus(s.id, e.target.value)}
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="ABSENT">ABSENT</option>
                    <option value="LATE">LATE</option>
                    <option value="LEAVE">LEAVE</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
