"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Button } from "@/app/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import DeleteDialog from "@/app/components/DeleteDialog";

type ExamWithClass = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  category: string;
  class: { id: string; name: string } | null;
};

type Props = { exams: ExamWithClass[] };

const MotionTableRow = motion(TableRow);

export default function ExamsTable({ exams }: Props) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/exams/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Exam deleted");
      setDeleteId(null);
      router.refresh();
    } catch {
      toast.error("Failed to delete exam");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100">
            <TableHead className="text-left">Name</TableHead>
            <TableHead className="text-left">Class</TableHead>
            <TableHead className="text-left">Category</TableHead>
            <TableHead className="text-left">Start Date</TableHead>
            <TableHead className="text-left">End Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {exams.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No exams found
              </TableCell>
            </TableRow>
          ) : (
            exams.map((exam) => (
              <MotionTableRow
                key={exam.id}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(243,244,246,0.5)" }}
                transition={{ duration: 0.2 }}
              >
                <TableCell>{exam.name}</TableCell>
                <TableCell>{exam.class?.name ?? "-"}</TableCell>
                <TableCell>{exam.category}</TableCell>
                <TableCell>{new Date(exam.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(exam.endDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/exams/${exam.id}/edit`}>
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(exam.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </MotionTableRow>
            ))
          )}
        </TableBody>
      </Table>

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Exam"
      />
    </>
  );
}
