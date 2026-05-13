"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/app/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Pencil, Trash2 } from "lucide-react";
import DeleteDialog from "@/app/components/DeleteDialog";

interface Homework {
  id: string;
  title: string;
  dueDate: string;
  createdAt: string;
  class: { id: string; name: string };
  subject: { id: string; name: string };
  teacher: { user: { name: string } };
  _count: { submissions: number };
}

export default function AdminHomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/homework");
        const json = await res.json();
        if (json.success) setHomework(json.data);
      } catch {
        toast.error("Failed to load homework");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/homework/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Homework deleted");
      setDeleteId(null);
      setHomework((prev) => prev.filter((h) => h.id !== deleteId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Homework</h1>
        <Link href="/admin/homework/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Homework
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Homework</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : homework.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No homework found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {homework.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.title}</TableCell>
                    <TableCell>{h.class.name}</TableCell>
                    <TableCell>{h.subject.name}</TableCell>
                    <TableCell>{h.teacher?.user?.name || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={new Date(h.dueDate) < new Date() ? "destructive" : "outline"}>
                        {format(new Date(h.dueDate), "MMM dd, yyyy")}
                      </Badge>
                    </TableCell>
                    <TableCell>{h._count.submissions}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/admin/homework/${h.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                        <Link href={`/admin/homework/${h.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="destructive" size="sm" onClick={() => setDeleteId(h.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Homework"
      />
    </div>
  );
}
