export const dynamic = "force-dynamic";

import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <Button asChild>
          <Link href="/admin/announcements/new">New Announcement</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((a: any) => (
          <Card key={a.id} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">{a.title}</CardTitle>
              <span className="text-xs text-muted-foreground">
                {new Date(a.createdAt).toLocaleString()}
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{a.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Visible to: {a.visibleRoles.map((v: any) => v.role).join(", ") || "All"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}