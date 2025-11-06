"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewExpensePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", amount: "", date: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onChange = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error(await res.text());
      router.push("/admin/expenses");
    } catch (err: any) {
      setError(err.message ?? "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">New Expense</h1>
      <form className="space-y-3 max-w-xl" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input className="w-full border rounded p-2 text-black" value={form.title} onChange={(e) => onChange("title", e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Amount</label>
            <input className="w-full border rounded p-2 text-black" value={form.amount} onChange={(e) => onChange("amount", e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Date</label>
            <input type="date" className="w-full border rounded p-2 text-black" value={form.date} onChange={(e) => onChange("date", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea className="w-full border rounded p-2 text-black" rows={4} value={form.description} onChange={(e) => onChange("description", e.target.value)} />
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


