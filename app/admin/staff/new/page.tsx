"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewStaffPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", adharNo: "", designation: "", salary: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onChange = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error(await res.text());
      router.push("/admin/staff");
    } catch (err: any) {
      setError(err.message ?? "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">New Staff</h1>
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
            <input className="w-full border rounded p-2 text-black" value={form.adharNo} onChange={(e) => onChange("adharNo", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Designation</label>
            <input className="w-full border rounded p-2 text-black" value={form.designation} onChange={(e) => onChange("designation", e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Salary</label>
            <input className="w-full border rounded p-2 text-black" value={form.salary} onChange={(e) => onChange("salary", e.target.value)} />
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


