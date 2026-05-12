"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/app/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

interface Submission {
  id: string;
  answerFile: string | null;
  remarks: string | null;
  status: string;
  submittedAt: string;
  gradedAt: string | null;
  teacherRemarks: string | null;
  student: {
    user: { name: string; email: string };
  };
}

interface HomeworkData {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  attachment: string | null;
  class: { name: string };
  subject: { name: string };
  submissions: Submission[];
}

export default function StaffHomeworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [homework, setHomework] = useState<HomeworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/homework/${params.id}`);
        const json = await res.json();
        if (json.success) setHomework(json.data);
      } catch {
        toast.error("Failed to load homework");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleGrade = async (submissionId: string) => {
    setSaving(submissionId);
    try {
      const res = await fetch(`/api/homework/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "GRADED",
          teacherRemarks: grading[submissionId] || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Submission graded");
      setHomework((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          submissions: prev.submissions.map((s) =>
            s.id === submissionId
              ? { ...s, status: "GRADED", teacherRemarks: grading[submissionId] || null, gradedAt: new Date().toISOString() }
              : s
          ),
        };
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to grade");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  }

  if (!homework) {
    return <div className="p-6 text-center text-muted-foreground">Homework not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{homework.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Class:</strong> {homework.class.name}</p>
          <p><strong>Subject:</strong> {homework.subject.name}</p>
          <p><strong>Due Date:</strong> {format(new Date(homework.dueDate), "MMM dd, yyyy")}</p>
          {homework.description && <p><strong>Description:</strong> {homework.description}</p>}
          {homework.attachment && (
            <p>
              <strong>Attachment:</strong>{" "}
              <a href={homework.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                View File
              </a>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submissions ({homework.submissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {homework.submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No submissions yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {homework.submissions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.student.user.name}</TableCell>
                    <TableCell>{format(new Date(s.submittedAt), "MMM dd, yyyy HH:mm")}</TableCell>
                    <TableCell>
                      {s.answerFile ? (
                        <a href={s.answerFile} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          View
                        </a>
                      ) : "N/A"}
                    </TableCell>
                    <TableCell>{s.remarks || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === "GRADED" ? "default" : "secondary"}>{s.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {s.status === "GRADED" ? (
                        <span className="text-sm text-muted-foreground">{s.teacherRemarks || "Graded"}</span>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <Textarea
                            className="min-w-[150px]"
                            placeholder="Remarks..."
                            value={grading[s.id] || ""}
                            onChange={(e) =>
                              setGrading((prev) => ({ ...prev, [s.id]: e.target.value }))
                            }
                          />
                          <Button size="sm" onClick={() => handleGrade(s.id)} disabled={saving === s.id}>
                            {saving === s.id ? "..." : "Grade"}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
