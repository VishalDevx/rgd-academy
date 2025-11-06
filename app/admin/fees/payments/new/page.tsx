"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewFeePaymentPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [form, setForm] = useState({ studentId: "", feeStructureId: "", amountPaid: "", status: "PAID" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/students").then(async (r) => setStudents(await r.json()));
    fetch("/api/fees/structures").then(async (r) => setStructures(await r.json()));
  }, []);

  const onChange = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/fees/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error(await res.text());
      router.push("/admin/fees");
    } catch (err: any) {
      setError(err.message ?? "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Record Fee Payment</h1>
      <form className="space-y-3 max-w-xl" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Student</label>
            <select className="w-full border rounded p-2 text-black" value={form.studentId} onChange={(e) => onChange("studentId", e.target.value)} required>
              <option value="" disabled>Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Fee Structure</label>
            <select className="w-full border rounded p-2 text-black" value={form.feeStructureId} onChange={(e) => onChange("feeStructureId", e.target.value)} required>
              <option value="" disabled>Select structure</option>
              {structures.map((s) => (
                <option key={s.id} value={s.id}>{s.name ?? s.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Amount Paid</label>
            <input className="w-full border rounded p-2 text-black" value={form.amountPaid} onChange={(e) => onChange("amountPaid", e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select className="w-full border rounded p-2 text-black" value={form.status} onChange={(e) => onChange("status", e.target.value)}>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="PARTIAL">PARTIAL</option>
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button type="button" className="px-3 py-2 rounded border" onClick={() => router.back()}>Cancel</button>
          <button type="submit" disabled={submitting} className={`px-3 py-2 rounded text-white ${submitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}>{submitting ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </div>
  );
}


