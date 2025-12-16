"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";

export interface Student {
  id: string;
  profileImg: string | null;
  user: { name: string; email: string };
  admissionNo: string;
  rollNumber: string;
  class: { name: string } | null;
}

export default function StudentsTable({ students }: { students: Student[] }) {
  const [query, setQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const router = useRouter();

  const classList = useMemo(() => {
    const unique = Array.from(
      new Set(students.map((s) => s.class?.name).filter(Boolean))
    );
    return ["all", ...unique];
  }, [students]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch = [s.user.name, s.user.email, s.admissionNo, s.rollNumber, s.class?.name]
        .some((val) => val?.toLowerCase().includes(query.toLowerCase()));

      const matchesClass =
        selectedClass === "all" || s.class?.name === selectedClass;

      return matchesSearch && matchesClass;
    });
  }, [students, query, selectedClass]);

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-3">
          <Input
            placeholder="Search students..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64 border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-300"
          />
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48 border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-300">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classList.map((cls) => (
                <SelectItem key={cls} value={cls ?? ""}>
                  {cls === "all" ? "All Classes" : cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length} result{filtered.length !== 1 && "s"} found
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-xl shadow-lg bg-white">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 text-gray-800">
              <TableHead>Profile</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Admission No</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Class</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <motion.tr
                key={s.id}
                className="cursor-pointer"
                whileHover={{ scale: 1.02, backgroundColor: "rgba(243,244,246,0.5)" }}
                transition={{ duration: 0.15 }}
                onClick={() => router.push(`/admin/students/${s.id}`)}
              >
                <TableCell>
                  {s.profileImg ? (
                    <Image
                      src={s.profileImg}
                      alt={s.user.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                      N/A
                    </div>
                  )}
                </TableCell>
                <TableCell>{s.user.name}</TableCell>
                <TableCell>{s.user.email}</TableCell>
                <TableCell>{s.admissionNo}</TableCell>
                <TableCell>{s.rollNumber}</TableCell>
                <TableCell>
                  {s.class?.name ? (
                    <Badge variant="secondary">{s.class.name}</Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
