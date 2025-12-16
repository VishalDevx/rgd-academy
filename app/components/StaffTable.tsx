// app/admin/staff/StaffTable.tsx
"use client";

import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";

interface Staff {
  id: string;
  user: { name: string; email: string };
  designation: string;
  salary: number | null;
}

type Props = {
  staff: Staff[];
};

const MotionTableRow = motion(TableRow);

export default function StaffTable({ staff }: Props) {
  return (
    <Table className="min-w-full divide-y divide-gray-200">
      <TableHeader>
        <TableRow className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100">
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Designation</TableHead>
          <TableHead>Salary</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {staff.map((s) => (
          <MotionTableRow
            key={s.id}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(243,244,246,0.5)" }}
            transition={{ duration: 0.2 }}
            className="cursor-pointer"
          >
            <TableCell>{s.user.name}</TableCell>
            <TableCell>{s.user.email}</TableCell>
            <TableCell>{s.designation}</TableCell>
            <TableCell>{s.salary ? `₹${s.salary.toLocaleString()}` : "-"}</TableCell>
          </MotionTableRow>
        ))}
      </TableBody>
    </Table>
  );
}
