export const dynamic = "force-dynamic";

import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Announcement } from "@prisma/client";
import { authOption } from "@/app/lib/auth";

type AnnouncementWithRoles = Announcement & {
  visibleRoles: { role: string }[];
};

export default async function AdminAnnouncementsPage() {
  const session = await getServerSession(authOption);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const items: AnnouncementWithRoles[] = await db.announcement.findMany({
    include: { visibleRoles: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Announcements
        </h1>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-md" asChild>
          <Link href="/admin/announcements/new">New Announcement</Link>
        </Button>
      </div>

      {/* Announcement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((a) => (
          <Card
            key={a.id}
            className="transition-transform transform hover:-translate-y-1 hover:shadow-xl shadow-md border border-gray-200 rounded-xl overflow-hidden"
          >
            <CardHeader className="flex flex-col gap-2 bg-gradient-to-r from-indigo-100 to-purple-50 p-4">
              <CardTitle className="text-lg md:text-xl font-bold text-gray-800">{a.title}</CardTitle>
              <span className="text-xs text-gray-500">
                {new Date(a.createdAt).toLocaleString()}
              </span>
            </CardHeader>

            <CardContent className="p-4 bg-white">
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">{a.content}</p>

              <p className="text-xs text-gray-500 mt-3">
                <span className="font-semibold text-gray-600">Visible to:</span>{" "}
                {a.visibleRoles.map((v) => v.role).join(", ") || "All"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
