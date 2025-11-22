"use client";

import React from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";

export interface StaffAttendanceUIProps {
  staffId: string;
  staffName: string;

  classes: {
    id: string;
    name: string;
    grade: string;
    section?: string | null;
    students: {
      id: string;
      user: {
        name: string | null;
        email: string | null;
      };
    }[];
  }[];
}

const StaffAttendanceUI: React.FC<StaffAttendanceUIProps> = ({
  classes,
  staffName,
  staffId,
}) => {
  // studentId → status
  const [status, setStatus] = React.useState<
    Record<string, "PRESENT" | "ABSENT" | "LATE" | "LEAVE">
  >({});

  function setStudentStatus(
    studentId: string,
    value: "PRESENT" | "ABSENT" | "LATE" | "LEAVE"
  ) {
    setStatus((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  }

  async function submitAttendance(cls: {
    id: string;
    students: { id: string }[];
  }) {
    const payload = {
      staffId,
      classId: cls.id,
      date: new Date().toISOString(),
      records: cls.students.map((student) => ({
        studentId: student.id,
        status: status[student.id] || "PRESENT",
      })),
    };

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials:"include",
      body: JSON.stringify(payload),
    });

    const out = await res.json();
    console.log("Attendance submitted:", out);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-sm text-muted-foreground">{staffName}</p>
      </div>

      {/* No class assigned */}
      {classes.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center text-muted-foreground">
            You are not assigned to any class yet.
          </CardContent>
        </Card>
      )}

      {/* Classes */}
      <div>
        {classes.map((cls) => (
          <Card key={cls.id} className="hover:shadow-sm transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {cls.name} <Badge variant="secondary">{cls.grade}</Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Section:</span> {cls.section || "N/A"}
              </p>

              <p className="text-sm">
                <span className="font-medium">Total Students:</span>{" "}
                {cls.students.length}
              </p>

              {/* Students */}
              <div className="space-y-1">
                {cls.students.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    No students in this class
                  </span>
                )}

                {cls.students.map((student) => {
                  const current = status[student.id];

                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {student.user.name ?? "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.user.email ?? ""}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Badge
                          variant={current === "PRESENT" ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => setStudentStatus(student.id, "PRESENT")}
                        >
                          PRESENT
                        </Badge>

                        <Badge
                          variant={current === "ABSENT" ? "default" : "destructive"}
                          className="cursor-pointer"
                          onClick={() => setStudentStatus(student.id, "ABSENT")}
                        >
                          ABSENT
                        </Badge>

                        <Badge
                          variant={current === "LATE" ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setStudentStatus(student.id, "LATE")}
                        >
                          LATE
                        </Badge>

                        <Badge
                          variant={current === "LEAVE" ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setStudentStatus(student.id, "LEAVE")}
                        >
                          LEAVE
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button className="mt-2" size="sm" onClick={() => submitAttendance(cls)}>
                Mark Attendance
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StaffAttendanceUI;
