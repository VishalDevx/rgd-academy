export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminStudentsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const students = await db.student.findMany({ include: { user: true, class: true }, orderBy: { admissionDate: "desc" } } as any);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Students</h1>
        <Link href="/admin/students/new" className="px-3 py-2 rounded bg-blue-600 text-white text-sm">
          New Student
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-50 text-left text-sm">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Admission No</th>
              <th className="p-2 border">Roll</th>
              <th className="p-2 border">Class</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="text-sm">
                <td className="p-2 border">{s.user.name}</td>
                <td className="p-2 border">{s.user.email}</td>
                <td className="p-2 border">{s.admissionNo}</td>
                <td className="p-2 border">{s.rollNumber}</td>
                <td className="p-2 border">{s.class ? `${s.classId.name}` : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


