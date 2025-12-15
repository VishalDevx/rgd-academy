"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

/* ---------- Types ---------- */

interface Class {
  id: string;
  name: string;
}

interface Exam {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name?: string;
  user?: { name?: string };
}

interface Subject {
  id: string;
  name: string;
}

interface ResultForm {
  classId: string;
  examId: string;
  studentId: string;
  subjectId: string;
  marks: string;
  maxMarks: string;
}

/* ---------- Component ---------- */

export default function AdminAddResult() {
  const router = useRouter();

  const [classes, setClasses] = useState<Class[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<ResultForm>({
    classId: "",
    examId: "",
    studentId: "",
    subjectId: "",
    marks: "",
    maxMarks: "",
  });

  /* ---------- Helpers ---------- */
  const update = (key: keyof ResultForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /* ---------- Fetch Classes ---------- */
  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then((d) => setClasses(d.data ?? []))
      .catch(() => toast.error("Failed to load classes"));
  }, []);

  /* ---------- Fetch Exams & Students when Class changes ---------- */
  useEffect(() => {
    if (!form.classId) {
      setExams([]);
      setStudents([]);
      update("examId", "");
      update("studentId", "");
      update("subjectId", "");
      setSubjects([]);
      return;
    }

    // Fetch exams
    fetch(`/api/exams?classId=${form.classId}`)
      .then((r) => r.json())
      .then((d) => setExams(d.data ?? []))
      .catch(() => toast.error("Failed to load exams"));

  fetch("/api/students")
       .then((res) => res.json())
       .then((data: Student[]) => setStudents(data))
       .catch(() => toast.error("Failed to load students"));

    // Reset dependent fields
    update("examId", "");
    update("studentId", "");
    update("subjectId", "");
    setSubjects([]);
  }, [form.classId]);

  /* ---------- Fetch Subjects when Exam changes ---------- */
  useEffect(() => {
    if (!form.examId) {
      setSubjects([]);
      update("subjectId", "");
      return;
    }

    fetch(`/api/subjects?examId=${form.examId}`)
      .then((r) => r.json())
      .then((d) => setSubjects(d.data ?? []))
      .catch(() => toast.error("Failed to load subjects"));

    update("subjectId", "");
  }, [form.examId]);

  /* ---------- Submit ---------- */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.classId || !form.examId || !form.studentId || !form.subjectId) {
      toast.error("Please select class, exam, student and subject.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Result added successfully");
      router.back();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save result");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add Result</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            {/* Class */}
            <div>
              <Label>Class</Label>
              <Select value={form.classId} onValueChange={(v) => update("classId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exam */}
            <div>
              <Label>Exam</Label>
              <Select value={form.examId} onValueChange={(v) => update("examId", v)} disabled={!form.classId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Student */}
            <div>
              <Label>Student</Label>
              <Select value={form.studentId} onValueChange={(v) => update("studentId", v)} disabled={!form.classId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.user?.name || s.name || "Unnamed Student"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div>
              <Label>Subject</Label>
              <Select value={form.subjectId} onValueChange={(v) => update("subjectId", v)} disabled={!form.examId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Marks */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Marks</Label>
                <Input value={form.marks} onChange={(e) => update("marks", e.target.value)} />
              </div>
              <div>
                <Label>Max Marks</Label>
                <Input value={form.maxMarks} onChange={(e) => update("maxMarks", e.target.value)} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Result"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
