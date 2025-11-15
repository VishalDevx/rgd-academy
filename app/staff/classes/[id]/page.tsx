import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import Link from "next/link";

export default async function StaffClassDetailPage({ params }: any) {
  const session = await getServerSession(authConfig);
  if (!session?.user || session.user.role !== "STAFF") redirect("/login");

  const cls = await db.class.findFirst({
    where: { id: params.id, teacherId: session.user.id },
    include: {
      students: { include: { user: true } },
      subjects: true,
    },
  });

  if (!cls) return notFound();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{cls.name}</h1>
        <p className="text-sm text-muted-foreground">
          Grade {cls.grade} • Section {cls.section || "N/A"}
        </p>
      </div>

      {/* Subjects */}
      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {cls.subjects.map((s) => (
            <Badge key={s.id} variant="outline">{s.name}</Badge>
          ))}
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({cls.students.length})</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-2">
          {cls.students.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between border rounded p-2"
            >
              <div>
                <p className="font-medium">{s.user.name}</p>
                <p className="text-xs text-muted-foreground">{s.user.email}</p>
              </div>

              <Link
                href={`/staff/attendance/${cls.id}/${s.id}`}
                className="text-blue-600 text-sm"
              >
                Mark Attendance →
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
