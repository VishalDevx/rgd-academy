"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ClassItem { id: string; name: string; grade: string }

export default function NewStudentPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    adharNo: "",
    admissionNo: "",
    rollNumber: "",
    classId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/classes").then(async (r) => setClasses(await r.json()));
  }, []);

  const onChange = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push("/admin/students");
    } catch (err: any) {
      setError(err.message ?? "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">New Student</h1>
      <form className="space-y-3 max-w-xl" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="w-full border rounded p-2 text-black" value={form.name} onChange={(e) => onChange("name", e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="w-full border rounded p-2 text-black" value={form.email} onChange={(e) => onChange("email", e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Aadhar No</label>
            <input className="w-full border rounded p-2 text-black" value={form.adharNo} onChange={(e) => onChange("adharNo", e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Admission No</label>
            <input className="w-full border rounded p-2 text-black" value={form.admissionNo} onChange={(e) => onChange("admissionNo", e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Roll Number</label>
            <input className="w-full border rounded p-2 text-black" value={form.rollNumber} onChange={(e) => onChange("rollNumber", e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Class</label>
            <select className="w-full border rounded p-2 text-black" value={form.classId} onChange={(e) => onChange("classId", e.target.value)}>
              <option value="">Unassigned</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.grade})</option>
              ))}
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button type="button" className="px-3 py-2 rounded border" onClick={() => router.back()}>Cancel</button>
          <button type="submit" disabled={submitting} className={`px-3 py-2 rounded text-white ${submitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}>{submitting ? "Creating..." : "Create"}</button>
        </div>
      </form>
    </div>
  );
}


