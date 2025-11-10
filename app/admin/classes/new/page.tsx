"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const GRADES = [
  "NURSERY",
  "LKG",
  "UKG",
  "ONE",
  "TWO",
  "THREE",
  "FOUR",
  "FIVE",
  "SIX",
  "SEVEN",
  "EIGHT",
  "NINE",
  "TEN",
];

export default function NewClassPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("TEN");
  const [section, setSection] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, grade, section }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create");
      }
      router.push("/admin/classes");
    } catch (err: any) {
      setError(err.message ?? "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">New Class</h1>
      <form className="space-y-3 max-w-md" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            className="w-full border rounded p-2 text-black"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Grade</label>
          <select
            className="w-full border rounded p-2 text-black"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          >
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Section</label>
          <input
            className="w-full border rounded p-2 text-black"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="A, B, ..."
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            className="px-3 py-2 rounded border"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-3 py-2 rounded text-white ${
              submitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}




