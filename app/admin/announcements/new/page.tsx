"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ROLES = ["ADMIN", "STAFF", "STUDENT"];

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", content: "", roles: [] as string[] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleRole = (role: string) => {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error(await res.text());
      router.push("/admin/announcements");
    } catch (err: any) {
      setError(err.message ?? "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">New Announcement</h1>
      <form className="space-y-3 max-w-xl" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input className="w-full border rounded p-2 text-black" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Content</label>
          <textarea className="w-full border rounded p-2 text-black" rows={5} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Visible Roles</label>
          <div className="flex gap-3">
            {ROLES.map((r) => (
              <label key={r} className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={form.roles.includes(r)} onChange={() => toggleRole(r)} /> {r}
              </label>
            ))}
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


