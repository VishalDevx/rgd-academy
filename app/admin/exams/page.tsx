export const dynamic = "force-dynamic";

import Link from "next/link";
import {  authConfig } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";

export default async function AdminExamsPage() {
 const session = await getServerSession(authConfig)
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const exams = await db.exam.findMany({ include: { class: true }, orderBy: { startDate: "desc" } } as any);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Exams</h1>
        <Link href="/admin/exams/new" className="px-3 py-2 rounded bg-blue-600 text-white text-sm">New Exam</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Class</th>
              <th className="p-2 border">Start</th>
              <th className="p-2 border">End</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((e: any) => (
              <tr key={e.id}>
                <td className="p-2 border">{e.name}</td>
                <td className="p-2 border">{e.class?.name}</td>
                <td className="p-2 border">{new Date(e.startDate).toLocaleDateString()}</td>
                <td className="p-2 border">{new Date(e.endDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


