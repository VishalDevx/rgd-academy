"use client";

import { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface MarksheetResponse {
  student: { 
    id: string; 
    name: string; 
    rollNumber: string; 
    class: { name: string; academicSession: string }; // updated
  };
  
  exams: { id: string; name: string; category: string; sequence: number | null }[];
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

export default function MarksheetClient({ studentId }: { studentId: string }) {
  const [data, setData] = useState<MarksheetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const marksheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!studentId) return;

    fetch(`/api/marksheet?studentId=${studentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch marksheet");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [studentId]);

  const handleDownload = async () => {
    if (!marksheetRef.current || !data) return;

    const canvas = await html2canvas(marksheetRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${data.student.name}_Marksheet.pdf`);
  };

  if (loading) return <div className="py-12 text-center text-gray-500">Loading…</div>;
  if (error) return <div className="py-12 text-center text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-[Inter] bg-gray-100">
      {/* ACTION BAR */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleDownload}
          className="rounded-md bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition"
        >
          Download Marksheet
        </button>
      </div>

      {/* MARKSHEET */}
      <div
        ref={marksheetRef}
        className="bg-white text-gray-900 rounded-none shadow-none p-8 md:p-12"
      >
        {/* HEADER */}
        <div className="text-center border-b-2 border-black pb-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide uppercase">
            R.G.D. Modern Academy
          </h1>
          <p className="mt-2 text-sm tracking-wide">
            Bharapur Nagina, Distt. Bijnor (U.P.)
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.3em] text-gray-600">
            Academic Marksheet
          </p>
        </div>

        {/* STUDENT INFO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 text-sm">
          <Info label="Student Name" value={data.student.name} />
          <Info label="Class" value={data.student.class.name} />
          <Info label="Roll Number" value={data.student.rollNumber} />
          <Info label="Session" value={data.student.class.academicSession} />
        </div>

        {/* MARKS TABLE */}
        <div className="overflow-x-auto mb-10">
          <table className="w-full min-w-[900px] border border-black text-sm">
            <thead>
              <tr className="bg-gray-200">
                <Th rowSpan={2}>Subject</Th>
                <Th colSpan={4}>Unit Test</Th>
                <Th colSpan={2}>Half Yearly</Th>
                <Th colSpan={2}>Annual</Th>
                <Th colSpan={2}>Grand Total</Th>
              </tr>
              <tr className="bg-gray-100">
                {["UT-I", "UT-II", "Max", "Obt", "Max", "Obt", "Max", "Obt", "Max", "Obt"].map(
                  (h, i) => <Th key={i}>{h}</Th>
                )}
              </tr>
            </thead>

            <tbody>
              {data.subjects.map((sub) => {
                const ut1 = sub.exams.find(e => e.category === "UNIT_TEST" && e.sequence === 1);
                const ut2 = sub.exams.find(e => e.category === "UNIT_TEST" && e.sequence === 2);
                const half = sub.exams.find(e => e.category === "HALF_YEARLY");
                const annual = sub.exams.find(e => e.category === "ANNUAL");

                return (
                  <tr key={sub.subjectId}>
                    <Td bold>{sub.subjectName}</Td>
                    <Td center>{ut1?.marks ?? ""}</Td>
                    <Td center>{ut2?.marks ?? ""}</Td>
                    <Td center>{(ut1?.maxMarks ?? 0) + (ut2?.maxMarks ?? 0)}</Td>
                    <Td center>{(ut1?.marks ?? 0) + (ut2?.marks ?? 0)}</Td>
                    <Td center>{half?.maxMarks ?? ""}</Td>
                    <Td center>{half?.marks ?? ""}</Td>
                    <Td center>{annual?.maxMarks ?? ""}</Td>
                    <Td center>{annual?.marks ?? ""}</Td>
                    <Td center>{sub.totalMaxMarks}</Td>
                    <Td center bold>{sub.totalMarks}</Td>
                  </tr>
                );
              })}

              <tr className="font-bold bg-gray-200">
                <Td>Total</Td>
                <td colSpan={9}></td>
                <Td center>{data.summary.totalMaxMarks}</Td>
                <Td center>{data.summary.totalMarks}</Td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-14">
          <Info label="Percentage" value={`${data.summary.percentage}%`} />
          <Info label="Division" value={data.summary.division} />
          <Info
            label="Result"
            value={data.summary.division === "FAIL" ? "Fail" : "Pass"}
          />
        </div>

        {/* SIGNATURES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center text-sm">
          <Signature label="Guardian Signature" />
          <Signature label="Class Teacher" />
          <Signature label="Principal" />
        </div>
      </div>
    </div>
  );
}

/* ---------- UI HELPERS (STYLE ONLY) ---------- */

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black px-4 py-3">
      <p className="text-xs uppercase tracking-widest">{label}</p>
      <p className="mt-1 font-bold text-base">{value}</p>
    </div>
  );
}

function Th(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      className="border border-black px-3 py-2 text-center font-bold uppercase text-xs"
    />
  );
}

function Td({
  children,
  center,
  bold,
}: {
  children: React.ReactNode;
  center?: boolean;
  bold?: boolean;
}) {
  return (
    <td
      className={`border border-black px-3 py-2 ${
        center ? "text-center" : ""
      } ${bold ? "font-semibold" : ""}`}
    >
      {children}
    </td>
  );
}

function Signature({ label }: { label: string }) {
  return (
    <div>
      <div className="h-12 border-b border-black mb-2"></div>
      <p className="uppercase tracking-widest text-xs">{label}</p>
    </div>
  );
}
