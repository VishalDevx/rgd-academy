"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/app/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import DeleteDialog from "@/app/components/DeleteDialog";
import Link from "next/link";

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
  createdAt: string;
  class: { id: string; name: string };
  subject: { id: string; name: string };
  teacher: { user: { name: string; email: string } };
  submissions: Submission[];
}

export default function AdminHomeworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [homework, setHomework] = useState<HomeworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/homework/${params.id}`);
        const json = await res.json();
        if (json.success) setHomework(json.data);
        else toast.error(json.error || "Failed to load homework");
      } catch {
        toast.error("Failed to load homework");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/homework/${params.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Homework deleted");
      router.push("/admin/homework");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  }

  if (!homework) {
    return <div className="p-6 text-center text-muted-foreground">Homework not found.</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/homework/${homework.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{homework.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Class:</strong> {homework.class.name}</p>
          <p><strong>Subject:</strong> {homework.subject.name}</p>
          <p><strong>Teacher:</strong> {homework.teacher?.user?.name || "N/A"}</p>
          <p><strong>Due Date:</strong> {format(new Date(homework.dueDate), "MMM dd, yyyy")}</p>
          <p><strong>Created:</strong> {format(new Date(homework.createdAt), "MMM dd, yyyy h:mm a")}</p>
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
                  <TableHead>Teacher Remarks</TableHead>
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
                    <TableCell>{s.teacherRemarks || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Homework"
      />
    </div>
  );
}
