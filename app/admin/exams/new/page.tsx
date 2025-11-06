"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewExamPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", classId: "", startDate: "", endDate: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/classes").then(async (r) => setClasses(await r.json()));
  }, []);

  const onChange = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/exams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error(await res.text());
      router.push("/admin/exams");
    } catch (err: any) {
      setError(err.message ?? "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">New Exam</h1>
      <form className="space-y-3 max-w-xl" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="w-full border rounded p-2 text-black" value={form.name} onChange={(e) => onChange("name", e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Class</label>
            <select className="w-full border rounded p-2 text-black" value={form.classId} onChange={(e) => onChange("classId", e.target.value)} required>
              <option value="" disabled>Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Start Date</label>
            <input type="date" className="w-full border rounded p-2 text-black" value={form.startDate} onChange={(e) => onChange("startDate", e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">End Date</label>
            <input type="date" className="w-full border rounded p-2 text-black" value={form.endDate} onChange={(e) => onChange("endDate", e.target.value)} required />
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


