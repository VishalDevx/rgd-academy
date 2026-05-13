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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import DeleteDialog from "@/app/components/DeleteDialog";
import Pagination from "@/app/components/Pagination";

interface Class { id: string; name: string }
interface Student { id: string; user: { name: string } }
interface Exam { id: string; name: string }

interface ResultRow {
  id: string;
  marks: number;
  maxMarks: number;
  grade: string | null;
  exam: { id: string; name: string };
  subject: { id: string; name: string };
  student: { id: string; user: { name: string } };
}

const PAGE_SIZE = 15;

export default function AdminResultPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [classes, setClasses] = useState<Class[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [classId, setClassId] = useState("");
  const [examId, setExamId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then((res) => setClasses(res.data ?? []))
      .catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    if (!classId) return;
    fetch(`/api/exams?classId=${classId}`)
      .then((r) => r.json())
      .then((res) => setExams(res.data ?? []))
      .catch(() => setExams([]));
  }, [classId]);

  useEffect(() => {
    if (!classId) return;
    fetch(`/api/students/by-class?classId=${classId}`)
      .then((r) => r.json())
      .then((res) => setStudents(res.data ?? []))
      .catch(() => setStudents([]));
  }, [classId]);

  useEffect(() => {
    if (!examId) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (examId) params.set("examId", examId);
    if (studentId) params.set("studentId", studentId);
    if (classId) params.set("classId", classId);
    fetch(`/api/results?${params}`)
      .then((r) => r.json())
      .then((data) => setResults(Array.isArray(data) ? data : []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [examId, studentId, classId]);

  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const paginated = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/results/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Result deleted");
      setDeleteId(null);
      setResults((prev) => prev.filter((r) => r.id !== deleteId));
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Results Management</CardTitle>
          {session?.user.role !== "STUDENT" && (
            <Button onClick={() => router.push("/admin/results/new")}>
              <Plus className="h-4 w-4 mr-2" /> Add Result
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={classId} onValueChange={(v) => { setClassId(v); setStudents([]); setStudentId(""); setExamId(""); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={examId} onValueChange={(v) => { setExamId(v); setPage(1); }} disabled={!classId}>
              <SelectTrigger><SelectValue placeholder="Select Exam" /></SelectTrigger>
              <SelectContent>
                {exams.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={studentId} onValueChange={(v) => { setStudentId(v); setPage(1); }} disabled={!classId}>
              <SelectTrigger><SelectValue placeholder="All Students" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Students</SelectItem>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => router.push(`/admin/marksheet/${studentId}`)} disabled={!studentId} variant="outline">
              View Marksheet
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results ({results.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : !examId ? (
            <div className="text-center py-8 text-muted-foreground">Select an exam to view results</div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No results found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.student.user.name}</TableCell>
                      <TableCell>{r.exam.name}</TableCell>
                      <TableCell>{r.subject.name}</TableCell>
                      <TableCell>{r.marks}/{r.maxMarks}</TableCell>
                      <TableCell><Badge variant="outline">{r.grade || "-"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/results/${r.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setDeleteId(r.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                page={page}
                totalPages={totalPages}
                total={results.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Result"
      />
    </div>
  );
}
