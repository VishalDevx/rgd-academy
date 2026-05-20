"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft, Upload, CheckCircle2, Clock } from "lucide-react";
import { usePDF } from "@/app/lib/usePDF";
import { PDFDownloadButton } from "@/app/components/PDFDownloadButton";

interface HomeworkData {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  attachment: string | null;
  class: { name: string };
  subject: { name: string };
  teacher: { user: { name: string } };
  submissions: {
    id: string;
    answerFile: string | null;
    remarks: string | null;
    status: string;
    submittedAt: string;
    gradedAt: string | null;
    teacherRemarks: string | null;
  }[];
}

export default function StudentHomeworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [homework, setHomework] = useState<HomeworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerFile, setAnswerFile] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pdf = usePDF(`homework-${params.id}`);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/homework/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeworkId: params.id,
          answerFile: answerFile || undefined,
          remarks: remarks || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Homework submitted!");
      const json = await res.json();
      setHomework((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          submissions: [json.data],
        };
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  }

  if (!homework) {
    return <div className="p-6 text-center text-muted-foreground">Homework not found.</div>;
  }

  const submission = homework.submissions?.[0];
  const isOverdue = new Date(homework.dueDate) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <PDFDownloadButton onClick={pdf.generatePDF} loading={pdf.loading} label="Download PDF" />
      </div>

      <div ref={pdf.ref}>
        <Card>
        <CardHeader>
          <CardTitle>{homework.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Subject:</strong> {homework.subject.name}</p>
          <p><strong>Class:</strong> {homework.class.name}</p>
          <p><strong>Teacher:</strong> {homework.teacher?.user?.name || "N/A"}</p>
          <p>
            <strong>Due Date:</strong>{" "}
            <Badge variant={isOverdue ? "destructive" : "outline"}>
              {format(new Date(homework.dueDate), "MMM dd, yyyy")}
            </Badge>
          </p>
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

      {submission ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Status:</strong>{" "}
              <Badge variant={submission.status === "GRADED" ? "default" : "secondary"}>
                {submission.status === "GRADED" ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" /> Graded</>
                ) : (
                  <><Clock className="h-3 w-3 mr-1" /> Submitted</>
                )}
              </Badge>
            </p>
            <p><strong>Submitted:</strong> {format(new Date(submission.submittedAt), "MMM dd, yyyy HH:mm")}</p>
            {submission.answerFile && (
              <p>
                <strong>Answer File:</strong>{" "}
                <a href={submission.answerFile} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  View
                </a>
              </p>
            )}
            {submission.remarks && <p><strong>Your Remarks:</strong> {submission.remarks}</p>}
            {submission.gradedAt && (
              <p><strong>Graded At:</strong> {format(new Date(submission.gradedAt), "MMM dd, yyyy HH:mm")}</p>
            )}
            {submission.teacherRemarks && (
              <p><strong>Teacher Remarks:</strong> {submission.teacherRemarks}</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Submit Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Answer File URL (optional)</Label>
                <Input
                  value={answerFile}
                  onChange={(e) => setAnswerFile(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Remarks (optional)</Label>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Any notes for the teacher..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="submit" disabled={submitting}>
                  <Upload className="h-4 w-4 mr-2" />
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
