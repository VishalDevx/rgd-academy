import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOption } from "@/app/lib/auth";
import { db } from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import Link from "next/link";

// PageProps with Promise-wrapped params
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StaffClassDetailPage({ params }: PageProps) {
  const { id } = await params; // await because params is a Promise

  const session = await getServerSession(authOption);
  if (!session?.user || session.user.role !== "STAFF") redirect("/login");

  const cls = await db.class.findFirst({
    where: { id, teacherId: session.user.id },
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
          Grade {cls.grade} • Section {cls.section ?? "N/A"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {cls.subjects.map((subject) => (
            <Badge key={subject.id} variant="outline">
              {subject.name}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Students ({cls.students.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {cls.students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between border rounded p-2"
            >
              <div>
                <p className="font-medium">{student.user.name}</p>
                <p className="text-xs text-muted-foreground">{student.user.email}</p>
              </div>

              <Link
                href={`/staff/attendance/${cls.id}/${student.id}`}
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
