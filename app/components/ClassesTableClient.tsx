"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/app/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import DeleteDialog from "@/app/components/DeleteDialog";
import Pagination from "@/app/components/Pagination";

type ClassRow = {
  id: string;
  name: string;
  grade: string;
  section?: string | null;
  teacher?: { user?: { name?: string } | null } | null;
  academicSession?: { name?: string } | null;
};

type Props = { classes: ClassRow[] };

const PAGE_SIZE = 10;

export default function ClassesTableClient({ classes }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    return classes.filter((c) =>
      [c.name, c.grade, c.section, c.teacher?.user?.name, c.academicSession?.name]
        .some((val) => val?.toLowerCase().includes(query.toLowerCase()))
    );
  }, [classes, query]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/classes/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Class deleted");
      setDeleteId(null);
      router.refresh();
    } catch {
      toast.error("Failed to delete class");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Classes</h1>
        <Button asChild>
          <Link href="/admin/classes/new"><Plus className="h-4 w-4 mr-2" /> New Class</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Classes</CardTitle>
            <Input
              placeholder="Search..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="w-48"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Class Teacher</TableHead>
                  <TableHead>Academic Session</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No classes found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((c) => (
                    <TableRow key={c.id}>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.grade}</TableCell>
                        <TableCell>{c.section ?? "-"}</TableCell>
                        <TableCell>{c.teacher?.user?.name || "-"}</TableCell>
                        <TableCell>{c.academicSession?.name || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/classes/${c.id}/edit`}>
                                <Pencil className="h-4 w-4 mr-1" /> Edit
                              </Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => { setDeleteId(c.id); setDeleteName(c.name); }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              total={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>

        <DeleteDialog
          open={!!deleteId}
          onOpenChange={(open) => { if (!open) setDeleteId(null); }}
          onConfirm={handleDelete}
          loading={deleting}
          title="Delete Class"
          entityName={deleteName}
        />
      </div>
  );
}
