import { getServerSession } from "next-auth";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  // ✅ Auth check
  const session = await getServerSession(authConfig);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  // ✅ Fetch students
  const students = await db.student.findMany({
    include: { user: true, class: true },
    orderBy: { admissionDate: "desc" },
  });

  return (
    <div className="p-6 bg-gray-200 max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Students</h1>
        <Link
          href="/admin/students/new"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
        >
          + Add Student
        </Link>
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
            {students.map((s, i) => (
              <tr
                key={s.id}
                className={`border-t ${
                  i % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-blue-50 transition`}
              >
                <td className="p-3">
                  {s.profileImg ? (
                    <img
                      src={s.profileImg}
                      alt={s.user.name}
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
