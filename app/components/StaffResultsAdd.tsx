"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { FileText, GraduationCap } from "lucide-react";

type StaffResultsAddProps = {
  staffName: string;
  classes: Array<{
    id: string;
    name: string;
    grade: string;
    section: string | null;
    students: Array<{
      id: string;
      rollNumber: string;
      user: { name: string; email: string | null };
    }>;
    subjects: Array<{
      id: string;
      name: string;
      code: string;
    }>;
  }>;
  exams: Array<{
    id: string;
    name: string;
    category: string;
    classId: string;
  }>;
};

export default function StaffResultsAdd({ staffName, classes, exams }: StaffResultsAddProps) {
  const router = useRouter();

  const [classId, setClassId] = useState<string>("");
  const [examId, setExamId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [marks, setMarks] = useState<string>("");
  const [maxMarks, setMaxMarks] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === classId) ?? null,
    [classes, classId]
  );

  const classExams = useMemo(
    () => exams.filter((e) => e.classId === classId),
    [exams, classId]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!classId || !examId || !subjectId || !studentId || !marks || !maxMarks) {
      setError("Please fill all required fields.");
      return;
    }

    const payload = {
      examId,
      studentId,
      subjectId,
      marks,
      maxMarks,
      grade: grade || undefined,
      remarks: remarks || undefined,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save result");
      }

      setSuccess("Result saved successfully.");
      setMarks("");
      setMaxMarks("");
      setGrade("");
      setRemarks("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save result");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Results</h1>
          <p className="text-gray-500 mt-1">
            Enter marks for your students • {staffName}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Result Entry
          </CardTitle>
          {selectedClass && (
            <Badge variant="outline">
              {selectedClass.name} • {selectedClass.grade}
              {selectedClass.section && ` • ${selectedClass.section}`}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Class */}
              <div>
                <Label className="mb-1 block">Class</Label>
                <Select
                  value={classId}
                  onValueChange={(v) => {
                    setClassId(v);
                    setExamId("");
                    setSubjectId("");
                    setStudentId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Exam */}
              <div>
                <Label className="mb-1 block">Exam</Label>
                <Select
                  value={examId}
                  onValueChange={setExamId}
                  disabled={!classId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {classExams.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name} ({e.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div>
                <Label className="mb-1 block">Subject</Label>
                <Select
                  value={subjectId}
                  onValueChange={setSubjectId}
                  disabled={!selectedClass}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedClass?.subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Student */}
              <div>
                <Label className="mb-1 block">Student</Label>
                <Select
                  value={studentId}
                  onValueChange={setStudentId}
                  disabled={!selectedClass}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedClass?.students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.user.name} ({s.user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Marks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-1 block">Marks Obtained</Label>
                <Input
                  type="number"
                  min={0}
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label className="mb-1 block">Maximum Marks</Label>
                <Input
                  type="number"
                  min={0}
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label className="mb-1 block">Grade (optional)</Label>
                <Input
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="A, B+, etc."
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <Label className="mb-1 block">Remarks (optional)</Label>
              <Input
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Good performance, needs improvement, etc."
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-600">
                {success}
              </p>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={submitting}>
                <FileText className="h-4 w-4 mr-2" />
                {submitting ? "Saving..." : "Save Result"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/staff/results")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

