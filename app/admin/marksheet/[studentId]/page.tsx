"use client";

import { useEffect, useState } from "react";
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

interface MarksheetResponse {
  student: {
    name: string;
    rollNumber: string;
    class: string;
  };
  exams: {
    id: string;
    name: string;
    category: string;
    sequence: number | null;
  }[];
  subjects: {
    subjectId: string;
    subjectName: string;
    exams: {
      examId: string;
      category: string;
      sequence: number | null;
      marks: number | null;
      maxMarks: number | null;
    }[];
    totalMarks: number;
    totalMaxMarks: number;
  }[];
  summary: {
    totalMarks: number;
    totalMaxMarks: number;
    percentage: number;
    division: string;
  };
}

export default function MarksheetPage({
  params,
}: {
  params: { studentId: string };
}) {
  const [data, setData] = useState<MarksheetResponse | null>(null);

  useEffect(() => {
    fetch(`/api/marksheet?studentId=${params.studentId}`)
      .then(res => res.json())
      .then(setData);
  }, [params.studentId]);

  if (!data) return <div>Loading…</div>;

  return (
    <div className="p-4 md:p-6 bg-background text-foreground">
      {/* -------- HEADER -------- */}
      <Card className="mb-4 text-center">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl font-bold">
            R.G.D. Modern Academy
          </CardTitle>
          <p className="text-sm md:text-base">Bharapur Nagina Distt. Bijnor (U.P.)</p>
        </CardHeader>
      </Card>

      {/* -------- STUDENT INFO -------- */}
      <Card className="mb-4">
        <CardContent className="flex flex-col md:flex-row md:justify-between text-sm md:text-base gap-2 md:gap-0">
          <div>Name: <b>{data.student.name}</b></div>
          <div>Class: <b>{data.student.class}</b></div>
          <div>Roll No: <b>{data.student.rollNumber}</b></div>
        </CardContent>
      </Card>

      {/* -------- MARKS TABLE -------- */}
      <div className="overflow-x-auto mb-4">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableCell rowSpan={2}>Subject</TableCell>
              <TableCell colSpan={4} className="text-center">Tests</TableCell>
              <TableCell colSpan={2} className="text-center">Half-Yearly</TableCell>
              <TableCell colSpan={2} className="text-center">Annual</TableCell>
              <TableCell colSpan={2} className="text-center">Grand Total</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-center">UT-I</TableCell>
              <TableCell className="text-center">UT-II</TableCell>
              <TableCell className="text-center">Max</TableCell>
              <TableCell className="text-center">Obt</TableCell>
              <TableCell className="text-center">Max</TableCell>
              <TableCell className="text-center">Obt</TableCell>
              <TableCell className="text-center">Max</TableCell>
              <TableCell className="text-center">Obt</TableCell>
              <TableCell className="text-center">Max</TableCell>
              <TableCell className="text-center">Obt</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.subjects.map(sub => {
              const ut1 = sub.exams.find(e => e.category === "UNIT_TEST" && e.sequence === 1);
              const ut2 = sub.exams.find(e => e.category === "UNIT_TEST" && e.sequence === 2);
              const half = sub.exams.find(e => e.category === "HALF_YEARLY");
              const annual = sub.exams.find(e => e.category === "ANNUAL");

              return (
                <TableRow key={sub.subjectId}>
                  <TableCell>{sub.subjectName}</TableCell>
                  <TableCell className="text-center">{ut1?.marks ?? ""}</TableCell>
                  <TableCell className="text-center">{ut2?.marks ?? ""}</TableCell>
                  <TableCell className="text-center">
                    {(ut1?.maxMarks ?? 0) + (ut2?.maxMarks ?? 0) || ""}
                  </TableCell>
                  <TableCell className="text-center">
                    {(ut1?.marks ?? 0) + (ut2?.marks ?? 0) || ""}
                  </TableCell>
                  <TableCell className="text-center">{half?.maxMarks ?? ""}</TableCell>
                  <TableCell className="text-center">{half?.marks ?? ""}</TableCell>
                  <TableCell className="text-center">{annual?.maxMarks ?? ""}</TableCell>
                  <TableCell className="text-center">{annual?.marks ?? ""}</TableCell>
                  <TableCell className="text-center">{sub.totalMaxMarks}</TableCell>
                  <TableCell className="text-center">{sub.totalMarks}</TableCell>
                </TableRow>
              );
            })}

            {/* TOTAL ROW */}
            <TableRow className="font-bold">
              <TableCell>Total</TableCell>
              <TableCell colSpan={9}></TableCell>
              <TableCell className="text-center">{data.summary.totalMaxMarks}</TableCell>
              <TableCell className="text-center">{data.summary.totalMarks}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* -------- SUMMARY -------- */}
      <Card className="mb-4">
        <CardContent className="flex flex-col md:flex-row md:justify-between text-sm md:text-base gap-2 md:gap-0">
          <div>Percentage: <b>{data.summary.percentage}%</b></div>
          <div>Division: <b>{data.summary.division}</b></div>
          <div>Result: <b>{data.summary.division === "FAIL" ? "Fail" : "Pass"}</b></div>
        </CardContent>
      </Card>

      {/* -------- SIGNATURES -------- */}
      <Card>
        <CardContent className="flex flex-col md:flex-row md:justify-between text-sm md:text-base gap-4 md:gap-0 mt-4">
          <div>Sign. Guardian</div>
          <div>Sign. Class Teacher</div>
          <div>Sign. Principal</div>
        </CardContent>
      </Card>
    </div>
  );
}
