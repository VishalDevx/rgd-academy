"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ClassItem {
  id: string;
  name: string;
  grade: string;
}

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
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/classes").then(async (r) => setClasses(await r.json()));
  }, []);

  const onChange = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (file) formData.append("file", file);

      const res = await fetch("/api/students", {
        method: "POST",
        body: formData,
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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">Add New Student</h1>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Grid fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2.5 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Aadhar No</label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2.5 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.adharNo}
              onChange={(e) => onChange("adharNo", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Admission No</label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2.5 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.admissionNo}
              onChange={(e) => onChange("admissionNo", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Roll Number</label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2.5 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.rollNumber}
              onChange={(e) => onChange("rollNumber", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Class</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.classId}
              onChange={(e) => onChange("classId", e.target.value)}
            >
              <option value="">Unassigned</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.grade})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Profile Image</label>
          <div className="flex items-center gap-4">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-full border border-gray-300"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border border-dashed border-gray-400 flex items-center justify-center text-gray-400 text-sm">
                No image
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm text-gray-700"
            />
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 rounded-lg text-white font-medium transition ${
              submitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {submitting ? "Creating..." : "Create Student"}
          </button>
        </div>
      </form>
    </div>
  );
}
