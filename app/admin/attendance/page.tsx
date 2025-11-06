"use client";

import { useEffect, useState } from "react";

export default function AdminAttendancePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/classes").then(async (r) => setClasses(await r.json()));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    fetch("/api/students").then(async (r) => {
      const all = await r.json();
      const list = all.filter((s: any) => s.classId === selectedClass);
      setStudents(list);
      setRecords(Object.fromEntries(list.map((s: any) => [s.id, "PRESENT"])));
    });
  }, [selectedClass]);

  const setStatus = (studentId: string, status: string) => setRecords((rec) => ({ ...rec, [studentId]: status }));

  const submit = async () => {
    if (!selectedClass) return;
    setSaving(true);
    setMessage("");
    try {
      const payload = { classId: selectedClass, date, records: students.map((s) => ({ studentId: s.id, status: records[s.id] || "PRESENT" })) };
      const res = await fetch("/api/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(await res.text());
      setMessage("Attendance saved");
    } catch (e: any) {
      setMessage(e.message ?? "Failed");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Attendance</h1>
      <div className="flex gap-3 items-end mb-4">
        <div>
          <label className="block text-sm mb-1">Class</label>
          <select className="border p-2 rounded text-black" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Date</label>
          <input type="date" className="border p-2 rounded text-black" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <button className={`px-3 py-2 rounded text-white ${saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`} onClick={submit} disabled={saving || !selectedClass}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {message && <p className="text-sm mb-3">{message}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2 border">Student</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td className="p-2 border">{s.user.name}</td>
                <td className="p-2 border">
                  <select className="border p-1 rounded text-black" value={records[s.id] || "PRESENT"} onChange={(e) => setStatus(s.id, e.target.value)}>
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


