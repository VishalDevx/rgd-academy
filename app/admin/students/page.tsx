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
    <div className="p-6 max-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Students</h1>
        <Link
          href="/admin/students/new"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
        >
          + Add Student
        </Link>
      </div>

      <StudentsTable students={students} />
    </div>
  );
}
