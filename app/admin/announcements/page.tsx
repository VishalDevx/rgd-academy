export const dynamic = "force-dynamic";

import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";

export default async function AdminAnnouncementsPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const items = await db.announcement.findMany({
    include: { visibleRoles: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Announcements</h1>
        <Link
          href="/admin/announcements/new"
          className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
        >
          New Announcement
        </Link>
      </div>
      <div className="space-y-3">
        {items.map((a: any) => (
          <div key={a.id} className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{a.title}</h3>
              <span className="text-xs text-gray-500">
                {new Date(a.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-1">{a.content}</p>
            <div className="text-xs text-gray-500 mt-2">
              Visible to: {a.visibleRoles.map((v: any) => v.role).join(", ") || "All"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
