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
import { Pencil, Trash2, Printer } from "lucide-react";
import { toast } from "sonner";
import React from "react";
import DeleteDialog from "@/app/components/DeleteDialog";
import { usePDF } from "@/app/lib/usePDF";
import { ExamTimetablePDF } from "@/app/components/PDFTemplates";

type DateSheetWithRelations = {
  id: string;
  exam: { id: string; name: string } | null;
  class: { id: string; name: string } | null;
  subject: { id: string; name: string } | null;
  examDate: Date;
  startTime: Date;
  endTime: Date;
  room?: string | null;
};

type Props = {
  groupedByClass: Record<string, DateSheetWithRelations[]>;
};

const MotionTableRow = motion(TableRow);

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTime(d: Date) {
  return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString();
}

export default function DateSheetTable({ groupedByClass }: Props) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [printClass, setPrintClass] = useState<string | null>(null);
  const [printData, setPrintData] = useState<DateSheetWithRelations[]>([]);
  const timetablePdf = usePDF("Exam_Timetable.pdf");

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/dateSheet/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Entry deleted");
      setDeleteId(null);
      router.refresh();
    } catch {
      toast.error("Failed to delete entry");
    } finally {
      setDeleting(false);
    }
  };

  const handlePrint = (className: string, sheets: DateSheetWithRelations[]) => {
    setPrintClass(className);
    setPrintData(sheets);
    setTimeout(() => {
      timetablePdf.generatePDF();
    }, 100);
  };

  return (
    <>
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100">
            <TableHead>Class</TableHead>
            <TableHead>Exam</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Exam Date</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Room</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {Object.entries(groupedByClass).length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No exam datesheets found
              </TableCell>
            </TableRow>
          ) : (
            Object.entries(groupedByClass).map(([className, sheets]) => (
              <React.Fragment key={className}>
                <TableRow className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 font-semibold">
                  <TableCell colSpan={7}>{className}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrint(className, sheets)}
                    >
                      <Printer className="h-4 w-4 mr-1" /> Print
                    </Button>
                  </TableCell>
                </TableRow>

                {sheets.map((ds) => (
                  <MotionTableRow
                    key={ds.id}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(243,244,246,0.5)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <TableCell>{ds.class?.name ?? "-"}</TableCell>
                    <TableCell>{ds.exam?.name ?? "-"}</TableCell>
                    <TableCell>{ds.subject?.name ?? "-"}</TableCell>
                    <TableCell>{formatDate(ds.examDate)}</TableCell>
                    <TableCell>{formatTime(ds.startTime)}</TableCell>
                    <TableCell>{formatTime(ds.endTime)}</TableCell>
                    <TableCell>{ds.room ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/date-sheet/${ds.id}/edit`}>
                            <Pencil className="h-4 w-4 mr-1" /> Edit
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteId(ds.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </MotionTableRow>
                ))}
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>

      {/* Hidden PDF Content */}
      <div className="hidden">
        <div ref={timetablePdf.ref}>
          {printData.length > 0 && printClass && (
            <ExamTimetablePDF
              examName={printData[0]?.exam?.name || "Exam"}
              className={printClass}
              dateSheet={printData.map((ds) => ({
                date: formatDate(ds.examDate),
                day: DAY_NAMES[new Date(ds.examDate).getDay()],
                subject: ds.subject?.name || "-",
                time: `${formatTime(ds.startTime)} - ${formatTime(ds.endTime)}`,
                room: ds.room || undefined,
              }))}
            />
          )}
        </div>
      </div>

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Date Sheet Entry"
      />
    </>
  );
}
