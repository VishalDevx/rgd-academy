// app/admin/fees/RecentPaymentsTable.tsx
"use client";

import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";

interface PaymentRecord {
  id: string;
  createdAt: Date;
  status: "PAID" | "PARTIAL" | "UNPAID";
  amountPaid: number;
  studentName: string;
  studentEmail: string;
  feeStructureName: string | null;
}

type Props = {
  payments: PaymentRecord[];
};

const MotionTableRow = motion(TableRow);

export default function RecentPaymentsTable({ payments }: Props) {
  return (
    <Table className="min-w-full divide-y divide-gray-200">
      <TableHeader>
        <TableRow className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100">
          <TableHead>Student</TableHead>
          <TableHead className="hidden sm:table-cell">Structure</TableHead>
          <TableHead className="hidden md:table-cell">Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((p) => (
          <MotionTableRow
            key={p.id}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(243,244,246,0.5)" }}
            transition={{ duration: 0.2 }}
            className="cursor-pointer"
          >
            <TableCell>
              <div className="font-medium">{p.studentName}</div>
              <div className="text-sm text-muted-foreground hidden md:inline">{p.studentEmail}</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">{p.feeStructureName}</TableCell>
            <TableCell className="hidden md:table-cell">{p.createdAt.toLocaleDateString()}</TableCell>
            <TableCell className="text-right">₹{p.amountPaid.toLocaleString()}</TableCell>
            <TableCell className="text-center">
              <Badge
                variant={
                  p.status === "PAID" ? "secondary" :
                  p.status === "PARTIAL" ? "outline" : "destructive"
                }
              >
                {p.status}
              </Badge>
            </TableCell>
          </MotionTableRow>
        ))}
      </TableBody>
    </Table>
  );
}
