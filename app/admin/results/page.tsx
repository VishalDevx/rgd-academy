"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface Exam {
  id: string;
  name: string;
}

interface Subject {
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
  grade?: string;
  subject: { name: string };
  student: { user: { name: string } };
  exam: { name: string };
}

export default function ResultPage() {
  const { data: session } = useSession();

  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Result[]>([]);

  const [examId, setExamId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [studentId, setStudentId] = useState("");

  const [marks, setMarks] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [grade, setGrade] = useState("");

  // ================= LOAD DROPDOWNS =================
  useEffect(() => {
    fetch("/api/exams")
    .then(r=>r.json())
    .then(res=>{
        if(Array.isArray(res)){
            setExams(res)
        }else if(Array.isArray(res?.data)){
            setExams(res.data)
        }else{
            setExams([])
        }
    })
fetch("/api/subjects")
  .then(r => r.json())
  .then(res => {
    if (Array.isArray(res)) {
      setSubjects(res);
    } else if (Array.isArray(res?.data)) {
      setSubjects(res.data);
    } else {
      setSubjects([]);
    }
  });


    fetch("/api/students")
      .then((r) => r.json())
      .then(setStudents);
  }, []);

  // ================= LOAD RESULTS =================
  async function loadResults() {
    const params = new URLSearchParams();
    if (examId) params.set("examId", examId);

    // STUDENT should only see his own results
    if (session?.user.role === "STUDENT") {
      params.set("studentId", session.user.id);
    } else if (studentId) {
      params.set("studentId", studentId);
    }

    const res = await fetch(`/api/result?${params.toString()}`);
    const data = await res.json();
    setResults(data);
  }

  // ================= CREATE RESULT =================
  async function submitResult() {
    if (!examId || !subjectId || !studentId) {
      alert("Missing fields");
      return;
    }

    const res = await fetch("/api/result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        examId,
        studentId,
        subjectId,
        marks,
        maxMarks,
        grade,
      }),
    });

    if (!res.ok) {
      alert("Failed to upload result");
      return;
    }

    loadResults();
  }

  // ================= UI =================
  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ---------- FILTER ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select onValueChange={setExamId}>
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

          {session?.user.role !== "STUDENT" && (
            <Select onValueChange={setStudentId}>
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
          )}

          <Button onClick={loadResults}>Get Results</Button>
        </div>

        {/* ---------- RESULT TABLE ---------- */}
        <div className="border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Student</th>
                <th className="p-2 text-left">Subject</th>
                <th className="p-2">Marks</th>
                <th className="p-2">Grade</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.student.user.name}</td>
                  <td className="p-2">{r.subject.name}</td>
                  <td className="p-2 text-center">
                    {r.marks}/{r.maxMarks}
                  </td>
                  <td className="p-2 text-center">{r.grade ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ---------- UPLOAD RESULT (ADMIN / STAFF) ---------- */}
        {session?.user.role !== "STUDENT" && (
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">Upload Result</h3>

            <Select onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Marks"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
              />
              <Input
                placeholder="Max Marks"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
              />
            </div>

            <Input
              placeholder="Grade (optional)"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />

            <Button onClick={submitResult}>Save Result</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
