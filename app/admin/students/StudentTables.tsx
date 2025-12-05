"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex gap-3">
          <Input
            placeholder="Search students..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64"
          />
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
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
      <div className="overflow-x-auto border rounded-xl shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
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
              <TableRow
                key={s.id}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => router.push(`/admin/students/${s.id}`)}
              >
                <TableCell>
                  {s.profileImg ? (
                    <Image
                      src={s.profileImg}
                      alt={s.user.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
