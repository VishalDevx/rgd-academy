export const dynamic = "force-dynamic";

import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { authOption } from "@/app/lib/auth";

// ---- Proper Type ----
type ExamWithClass = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  class: {
    id: string;
    name: string;
  } | null;
};

export default async function AdminExamsPage() {
  const session = await getServerSession(authOption);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  // Prisma already knows the shapes, but we cast to our stricter type
  const exams = (await db.exam.findMany({
    include: { class: true },
    orderBy: { startDate: "desc" },
  })) as ExamWithClass[];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Exams</h1>

        <Button asChild variant="default" size="sm">
          <Link href="/admin/exams/new">New Exam</Link>
        </Button>
      </div>

      {/* Exams Table Card */}
      <Card className="shadow-lg border border-gray-200">
        <CardHeader className="bg-gray-50">
          <CardTitle>Upcoming & Past Exams</CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="text-left">Name</TableHead>
                <TableHead className="text-left">Class</TableHead>
                <TableHead className="text-left">Start Date</TableHead>
                <TableHead className="text-left">End Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {exams.map((exam) => (
                <TableRow
                  key={exam.id}
                  className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <TableCell>{exam.name}</TableCell>
                  <TableCell>{exam.class?.name ?? "-"}</TableCell>
                  <TableCell>{new Date(exam.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(exam.endDate).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {exams.length === 0 && (
            <p className="text-center py-4 text-gray-500">No exams scheduled yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
