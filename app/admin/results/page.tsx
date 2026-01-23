"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

/* ---------- Types ---------- */

interface Class {
  id: string;
  name: string;
}

interface Student {
  id: string;
  user: { name: string };
}

/* ---------- Component ---------- */

export default function AdminResultPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");

  /* ---------- Load Classes ---------- */
  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then((res) => setClasses(res.data ?? []))
      .catch(() => setClasses([]));
  }, []);

  /* ---------- Load Students (by class) ---------- */
  useEffect(() => {
    if (!classId) return;

    fetch(`/api/students/by-class?classId=${classId}`)
      .then((r) => r.json())
      .then((res) => setStudents(res.data ?? []))
      .catch(() => setStudents([]));
  }, [classId]);

  /* ---------- View Marksheet ---------- */
  const viewMarksheet = () => {
    if (!studentId) {
      alert("Select a student first");
      return;
    }

    // EXACTLY what you asked for
    router.push(`/admin/marksheet/${studentId}`);
  };

  /* ---------- UI ---------- */

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>View Marksheet</CardTitle>

        {session?.user.role !== "STUDENT" && (
          <Button onClick={() => router.push("/admin/results/new")}>
            + Add Result
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Class */}
          <Select
            value={classId}
            onValueChange={(v) => {
              setClassId(v);
              setStudents([]);
              setStudentId("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Student */}
          <Select
            value={studentId}
            onValueChange={setStudentId}
            disabled={!classId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Action */}
          <Button onClick={viewMarksheet} disabled={!studentId}>
            View Marksheet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
