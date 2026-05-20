"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Lock, Unlock, Pencil, ArrowLeft, Calendar, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { usePDF } from "@/app/lib/usePDF";
import { PDFDownloadButton } from "@/app/components/PDFDownloadButton";

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface DateSheetEntry {
  id: string;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string | null;
  subject: Subject;
}

interface ExamDetail {
  id: string;
  name: string;
  category: string;
  sequence: number | null;
  startDate: string;
  endDate: string;
  isLocked: boolean;
  description: string | null;
  instructions: string | null;
  createdAt: string;
  class: { id: string; name: string } | null;
  createdBy: { name: string } | null;
  dateSheet: DateSheetEntry[];
  results: { id: string }[];
}

export default function ExamDetailClient({ exam }: { exam: ExamDetail }) {
  const router = useRouter();
  const [locked, setLocked] = useState(exam.isLocked);
  const [toggling, setToggling] = useState(false);
  const pdf = usePDF(`exam-${exam.id}`);

  const now = new Date();
  const startDate = new Date(exam.startDate);
  const endDate = new Date(exam.endDate);

  let status: { label: string; variant: "default" | "secondary" | "destructive" | "outline" };
  if (locked) {
    status = { label: "Locked", variant: "destructive" };
  } else if (now < startDate) {
    status = { label: "Upcoming", variant: "secondary" };
  } else if (now > endDate) {
    status = { label: "Completed", variant: "outline" };
  } else {
    status = { label: "Ongoing", variant: "default" };
  }

  const handleToggleLock = async () => {
    setToggling(true);
    try {
      const res = await fetch(`/api/exams/${exam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked: !locked }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setLocked(!locked);
      toast.success(`Exam ${locked ? "unlocked" : "locked"}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/exams">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{exam.name}</h1>
            <p className="text-sm text-gray-500">{exam.class?.name} — {exam.category.replace(/_/g, " ")}</p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        <div className="flex gap-2">
          <PDFDownloadButton onClick={pdf.generatePDF} loading={pdf.loading} label="PDF" />
          <Button
            variant={locked ? "outline" : "destructive"}
            size="sm"
            onClick={handleToggleLock}
            disabled={toggling}
          >
            {locked ? <Unlock className="h-4 w-4 mr-1" /> : <Lock className="h-4 w-4 mr-1" />}
            {locked ? "Unlock" : "Lock"}
          </Button>
          <Link href={`/admin/exams/${exam.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
          </Link>
        </div>
      </div>

      <div ref={pdf.ref}>
      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InfoCard icon={Calendar} label="Start Date" value={format(startDate, "MMM dd, yyyy")} />
        <InfoCard icon={Calendar} label="End Date" value={format(endDate, "MMM dd, yyyy")} />
        <InfoCard icon={Clock} label="Duration" value={`${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days`} />
        <InfoCard icon={Users} label="Subjects" value={`${exam.dateSheet.length} scheduled`} />
      </div>

      {/* Date Sheet */}
      <Card>
        <CardHeader>
          <CardTitle>Date Sheet</CardTitle>
        </CardHeader>
        <CardContent>
          {exam.dateSheet.length === 0 ? (
            <p className="text-gray-500 text-sm">No date sheet entries. Add one from the Exam Timetable page.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Room</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exam.dateSheet.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{format(new Date(entry.examDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="font-medium">{entry.subject.name}</TableCell>
                    <TableCell>{format(new Date(entry.startTime), "hh:mm a")}</TableCell>
                    <TableCell>{format(new Date(entry.endTime), "hh:mm a")}</TableCell>
                    <TableCell>{entry.room || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Description / Instructions */}
      {(exam.description || exam.instructions) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exam.description && (
            <Card>
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-600">{exam.description}</p></CardContent>
            </Card>
          )}
          {exam.instructions && (
            <Card>
              <CardHeader><CardTitle>Instructions</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-600 whitespace-pre-wrap">{exam.instructions}</p></CardContent>
            </Card>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-lg bg-blue-100 p-2.5">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
