export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminStaffPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const staff = await db.staff.findMany({ include: { user: true }, orderBy: { joinDate: "desc" } } as any);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Staff</h1>
        <Link href="/admin/staff/new" className="px-3 py-2 rounded bg-blue-600 text-white text-sm">
          New Staff
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-50 text-left text-sm">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Designation</th>
              <th className="p-2 border">Salary</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s: any) => (
              <tr key={s.id} className="text-sm">
                <td className="p-2 border">{s.user.name}</td>
                <td className="p-2 border">{s.user.email}</td>
                <td className="p-2 border">{s.designation}</td>
                <td className="p-2 border">{s.salary ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


