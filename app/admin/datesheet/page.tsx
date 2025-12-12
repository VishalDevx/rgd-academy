export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/prisma";
import { authOption } from "@/app/lib/auth";

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
import React from "react";

type DateSheetWithRelations = {
  id: string;
  exam: { id: string; name: string } | null;
  class: { id: string; name: string } | null;
  subject: { id: string; name: string } | null;
  examDate: Date;
  startTime: Date;
  endTime: Date;
  room?: string | null;
};

export default async function AdminDateSheetPage() {
  const session = await getServerSession(authOption);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const dateSheets = await db.examDateSheet.findMany({
    include: { exam: true, class: true, subject: true },
    orderBy: [{ classId: "asc" }, { examDate: "asc" }],
  }) as DateSheetWithRelations[];

  // Group dateSheets by class
  const groupedByClass = dateSheets.reduce((acc: Record<string, DateSheetWithRelations[]>, ds) => {
    const className = ds.class?.name || "Unknown Class";
    if (!acc[className]) acc[className] = [];
    acc[className].push(ds);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      {/* Header with title and button */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Exam Datesheet</h1>
        <Button asChild variant="default" size="sm">
          <Link href="/admin/datesheet/new">Add Timetable</Link>
        </Button>
      </div>

      <Card className="shadow-lg border border-gray-200">
        <CardHeader className="bg-gray-50">
          <CardTitle>All Classes</CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead>Class</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Exam Date</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Room</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {Object.entries(groupedByClass).map(([className, sheets]) => (
                <React.Fragment key={className}>
                  {/* Class header row */}
                  <TableRow className="bg-gray-200 font-semibold">
                    <TableCell colSpan={7}>{className}</TableCell>
                  </TableRow>

                  {/* Exams under this class */}
                  {sheets.map((ds) => (
                    <TableRow
                      key={ds.id}
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    >
                      <TableCell>{ds.class?.name ?? "-"}</TableCell>
                      <TableCell>{ds.exam?.name ?? "-"}</TableCell>
                      <TableCell>{ds.subject?.name ?? "-"}</TableCell>
                      <TableCell>{new Date(ds.examDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {new Date(ds.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell>
                        {new Date(ds.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell>{ds.room ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>

          {dateSheets.length === 0 && (
            <p className="text-center py-4 text-gray-500">No exams scheduled yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
