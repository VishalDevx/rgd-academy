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

interface Exam {
  id: string;
  name: string;
}

interface Student {
  id: string;
  user: { name: string };
}

interface Result {
  id: string;
  marks: number;
  maxMarks: number;
  grade?: string | null;
  subject: { name: string };
  student: { user: { name: string } };
  exam: { name: string };
}

/* ---------- Component ---------- */

export default function AdminResultPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Result[]>([]);

  const [examId, setExamId] = useState("");
  const [studentId, setStudentId] = useState("");

  /* ---------- Load Filters ---------- */

  useEffect(() => {
    fetch("/api/exams")
      .then((r) => r.json())
      .then((res) => setExams(res.data ?? res))
      .catch(() => setExams([]));

    fetch("/api/students")
      .then((r) => r.json())
      .then((res) => setStudents(res.data ?? res))
      .catch(() => setStudents([]));
  }, []);

  /* ---------- Load Results ---------- */

  const loadResults = async () => {
    const params = new URLSearchParams();
    if (examId) params.set("examId", examId);
    if (studentId) params.set("studentId", studentId);

    const res = await fetch(`/api/result?${params.toString()}`);
    const data = await res.json();
    setResults(Array.isArray(data) ? data : []);
  };

  /* ---------- UI ---------- */

  return (
    <Card>
      {/* ---------- HEADER ---------- */}
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Results</CardTitle>

        {session?.user.role !== "STUDENT" && (
          <Button onClick={() => router.push("/admin/results/new")}>
            + Add Result
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ---------- FILTERS ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={examId} onValueChange={setExamId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={studentId} onValueChange={setStudentId}>
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

          <Button onClick={loadResults}>Get Results</Button>
        </div>

        {/* ---------- TABLE ---------- */}
        <div className="border rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-2 text-left">Student</th>
                <th className="p-2 text-left">Subject</th>
                <th className="p-2 text-center">Marks</th>
                <th className="p-2 text-center">Grade</th>
                <th className="p-2 text-left">Exam</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    No results found
                  </td>
                </tr>
              )}

              {results.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.student.user.name}</td>
                  <td className="p-2">{r.subject.name}</td>
                  <td className="p-2 text-center">
                    {r.marks}/{r.maxMarks}
                  </td>
                  <td className="p-2 text-center">{r.grade ?? "-"}</td>
                  <td className="p-2">{r.exam.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
