import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/prisma";

import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/app/components/ui/table";
import { authOption } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminSubjectsPage() {
  const session = await getServerSession(authOption);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const subjects = await db.subject.findMany({
    include: {
      teacher: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <Button asChild>
          <Link href="/admin/subjects/new">New Subjects</Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>code</TableHead>
                <TableHead>classID </TableHead>
                <TableHead> Teacher</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {subjects.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.code}</TableCell>
                  <TableCell>{c.classId ?? "-"}</TableCell>
                  <TableCell>{c.teacher?.user?.name || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
