import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/prisma";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";

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

export const dynamic = "force-dynamic";

export default async function AdminClassesPage() {
  const session = await getServerSession(authConfig);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const classes = await db.class.findMany({
    orderBy: { createdAt: "desc" },
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
        <h1 className="text-2xl font-bold">Classes</h1>
        <Button asChild>
          <Link href="/admin/classes/new">New Class</Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Class Teacher</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {classes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.grade}</TableCell>
                  <TableCell>{c.section ?? "-"}</TableCell>
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
