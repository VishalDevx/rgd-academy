import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/prisma";
import StudentsTable from "./StudentTables";
import { authOption } from "@/app/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const session = await getServerSession(authOption);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const [students, totalCount, activeCount, classCount] = await Promise.all([
    db.student.findMany({
      include: { user: true, class: true },
      orderBy: { admissionDate: "desc" },
    }),
    db.student.count(),
    db.student.count({ where: { active: true } }),
    db.class.count(),
  ]);

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-xl rounded-xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Students</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalCount}</div></CardContent>
        </Card>
        <Card className="shadow-xl rounded-xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{activeCount}</div></CardContent>
        </Card>
        <Card className="shadow-xl rounded-xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Inactive</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{totalCount - activeCount}</div></CardContent>
        </Card>
        <Card className="shadow-xl rounded-xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Classes</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{classCount}</div></CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">Students</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/students/import"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold shadow-md transition-all"
          >
            Bulk Import
          </Link>
          <Link
            href="/admin/students/new"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-semibold shadow-md transition-all"
          >
            + Add Student
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <StudentsTable students={students} />
      </div>
    </div>
  );
}
