"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";


interface Student {
  id: string;
  profileImg: string | null;
  user: { name: string; email: string };
  admissionNo: string;
  rollNumber: string;
  class: { name: string } | null;
}

export default function StudentsTable({ students }: { students: Student[] }) {
  const [query, setQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const router = useRouter();

  const classList = useMemo(() => {
    const unique = Array.from(
      new Set(students.map((s) => s.class?.name).filter(Boolean))
    );
    return ["all", ...unique];
  }, [students]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch = [s.user.name, s.user.email, s.admissionNo, s.rollNumber, s.class?.name]
        .some((val) => val?.toLowerCase().includes(query.toLowerCase()));

      const matchesClass =
        selectedClass === "all" || s.class?.name === selectedClass;

      return matchesSearch && matchesClass;
    });
  }, [students, query, selectedClass]);

  return (
    <div>
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students..."
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm w-64"
          />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {classList.map((cls) => (
              <option key={cls} value={cls}>
                {cls === "all" ? "All Classes" : cls}
              </option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gray-500">
          {filtered.length} result{filtered.length !== 1 && "s"} found
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase tracking-wider text-gray-600">
            <tr>
              <th className="p-3 text-left">Profile</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Admission No</th>
              <th className="p-3 text-left">Roll No</th>
              <th className="p-3 text-left">Class</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr
                key={s.id}
                className={`border-t cursor-pointer ${
                  i % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-blue-50 transition`}
                onClick={() => router.push(`/admin/students/${s.id}`)}
              >
                <td className="p-3">
                  {s.profileImg ? (
                <Image
  src={s.profileImg}
  alt={s.user.name}
  width={40}
  height={40}
  className="w-10 h-10 rounded-full object-cover border border-gray-300"
/>

                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                      N/A
                    </div>
                  )}
                </td>
                <td className="p-3 font-medium text-gray-900">{s.user.name}</td>
                <td className="p-3">{s.user.email}</td>
                <td className="p-3">{s.admissionNo}</td>
                <td className="p-3">{s.rollNumber}</td>
                <td className="p-3">{s.class?.name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
