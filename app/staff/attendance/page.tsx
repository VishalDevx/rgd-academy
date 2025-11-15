

import * as React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

interface StaffAttendanceUIProps {
  classes: {
    id: string;
    name: string;
    grade: string;
    section?: string | null;
    students: {
      id: string;
      user: {
        name?: string | null;
        email?: string | null;
      };
      rollNumber: string;
    }[];
  }[];
  staffName: string;
  staffId: string;
}

const StaffAttendanceUI: React.FC<StaffAttendanceUIProps> = ({ classes, staffName }) => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-sm text-muted-foreground">{staffName}</p>
      </div>

      {classes.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center text-muted-foreground">
            You are not assigned to any class yet.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <Card key={cls.id} className="hover:shadow-sm transition">
            <CardHeader>
              <CardTitle>
                {cls.name} <Badge variant="secondary">{cls.grade}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Section:</span> {cls.section || "N/A"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Total Students:</span> {cls.students.length}
              </p>

              <div className="space-y-1">
                {cls.students.length === 0 && (
                  <span className="text-xs text-muted-foreground">No students in this class</span>
                )}
                {cls.students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <p className="text-sm font-medium">{student.user.name ?? "N/A"}</p>
                      <p className="text-xs text-muted-foreground">{student.user.email ?? ""}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">PRESENT</Badge>
                      <Badge variant="destructive">ABSENT</Badge>
                      <Badge variant="outline">LATE</Badge>
                      <Badge variant="outline">LEAVE</Badge>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="mt-2" size="sm">
                Mark Attendance
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default async function StaffAttendancePage() {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== "STAFF") {
    redirect("/login");
  }

  const classes = await db.class.findMany({
    where: { teacherId: session.user.id },
    include: {
      students: { include: { user: true } },
    },
  });

  return (
    <StaffAttendanceUI
      classes={classes}
      staffName={session.user.name ?? "Staff"}
      staffId={session.user.id}
    />
  );
}
