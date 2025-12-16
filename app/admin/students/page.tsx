import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/prisma";
import StudentsTable from "./StudentTables";
import { authOption } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const session = await getServerSession(authOption);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const students = await db.student.findMany({
    include: { user: true, class: true },
    orderBy: { admissionDate: "desc" },
  });

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">Students</h1>
        <Link
          href="/admin/students/new"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-semibold shadow-md transition-all"
        >
          + Add Student
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <StudentsTable students={students} />
      </div>
    </div>
  );
}
