// app/admin/date-sheet/DateSheetTable.tsx
"use client";

import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import React from "react";

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

export default function DateSheetTable({ groupedByClass }: Props) {
  return (
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
        </TableRow>
      </TableHeader>

      <TableBody>
        {Object.entries(groupedByClass).map(([className, sheets]) => (
          <React.Fragment key={className}>
            <TableRow className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 font-semibold">
              <TableCell colSpan={7}>{className}</TableCell>
            </TableRow>

            {sheets.map((ds) => (
              <MotionTableRow
                key={ds.id}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(243,244,246,0.5)" }}
                transition={{ duration: 0.2 }}
                className="cursor-pointer"
              >
                <TableCell>{ds.class?.name ?? "-"}</TableCell>
                <TableCell>{ds.exam?.name ?? "-"}</TableCell>
                <TableCell>{ds.subject?.name ?? "-"}</TableCell>
                <TableCell>{new Date(ds.examDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {new Date(ds.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </TableCell>
                <TableCell>
                  {new Date(ds.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </TableCell>
                <TableCell>{ds.room ?? "-"}</TableCell>
              </MotionTableRow>
            ))}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
}
