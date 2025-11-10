import { getServerSession } from "next-auth";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminClassesPage() {
  // ✅ Use the real NextAuth getServerSession
  const session = await getServerSession(authConfig);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const classes = await db.class.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Classes</h1>
        <Link href="/admin/classes/new" className="px-3 py-2 rounded bg-blue-600 text-white text-sm">
          New Class
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-50 text-left text-sm">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Grade</th>
              <th className="p-2 border">Section</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.id} className="text-sm">
                <td className="p-2 border">{c.name}</td>
                <td className="p-2 border">{c.grade}</td>
                <td className="p-2 border">{c.section ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
