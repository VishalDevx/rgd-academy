// app/admin/exams/ExamsTable.tsx
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

type ExamWithClass = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  category: string;
  class: {
    id: string;
    name: string;
  } | null;
};

type Props = {
  exams: ExamWithClass[];
};

const MotionTableRow = motion(TableRow);

export default function ExamsTable({ exams }: Props) {
  return (
    <Table className="min-w-full divide-y divide-gray-200">
      <TableHeader>
        <TableRow className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100">
          <TableHead className="text-left">Name</TableHead>
          <TableHead className="text-left">Class</TableHead>
          <TableHead className="text-left">Category</TableHead>
          <TableHead className="text-left">Start Date</TableHead>
          <TableHead className="text-left">End Date</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {exams.map((exam) => (
          <MotionTableRow
            key={exam.id}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(243,244,246,0.5)" }}
            transition={{ duration: 0.2 }}
            className="cursor-pointer"
          >
            <TableCell>{exam.name}</TableCell>
            <TableCell>{exam.class?.name ?? "-"}</TableCell>
            <TableCell>{exam.category}</TableCell>
            <TableCell>{new Date(exam.startDate).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(exam.endDate).toLocaleDateString()}</TableCell>
          </MotionTableRow>
        ))}
      </TableBody>
    </Table>
  );
}
