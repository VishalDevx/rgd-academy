"use client";

import { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Loader2, Download, Printer, User } from "lucide-react";
import Image from "next/image";

interface IDCardData {
  id: string;
  cardNo: string;
  issueDate: string;
  expiryDate: string | null;
  qrData: string | null;
  student?: {
    user: { name: string };
    class: { name: string } | null;
    admissionNo: string;
    bloodGroup: string | null;
    address: string | null;
    contactNo: string | null;
    dob: string | null;
  };
  staff?: {
    user: { name: string };
    designation: string;
    department: string | null;
    staffId: string | null;
    phone: string | null;
    address: string | null;
    dob: string | null;
  };
}

export function IDCardClient({ cardId }: { cardId: string }) {
  const [data, setData] = useState<IDCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/id-cards/${cardId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [cardId]);

  const downloadPDF = async () => {
    if (!cardRef.current) return;
    setPdfLoading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, 1);
      const w = imgWidth * ratio;
      const h = imgHeight * ratio;
      const x = (pdfWidth - w) / 2;
      const y = 20;
      pdf.addImage(imgData, "PNG", x, y, w, h);
      pdf.save(`id-card-${data?.cardNo ?? cardId}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setPdfLoading(false);
    }
  };

  const printCard = () => {
    if (!cardRef.current) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>ID Card</title>
          <style>
            body { margin: 0; padding: 20px; display: flex; justify-content: center; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${cardRef.current.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">ID card not found</div>
    );
  }

  const isStudent = !!data.student;
  const person = isStudent ? data.student : data.staff;
  const cls = isStudent ? (data.student?.class?.name ?? "") : (data.staff?.designation ?? "");
  const admissionOrStaffId = isStudent
    ? (data.student?.admissionNo ?? "")
    : (data.staff?.staffId ?? "");

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button onClick={downloadPDF} disabled={pdfLoading}>
          {pdfLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download PDF
        </Button>
        <Button variant="outline" onClick={printCard}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      <div ref={cardRef} className="flex justify-center">
        <div className="w-[340px] h-[520px] rounded-xl border-2 border-blue-800 bg-white shadow-xl overflow-hidden">
          <div className="bg-blue-800 text-white text-center py-3 px-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Image
                src="/logo.jpeg"
                alt="Logo"
                width={28}
                height={28}
                className="rounded-full"
              />
              <span className="font-bold text-sm">R. G. D. Academy</span>
            </div>
            <p className="text-[10px] text-blue-200">
              Affiliated to CBSE, New Delhi
            </p>
          </div>

          <div className="flex flex-col items-center px-4 py-3">
            <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-blue-800 flex items-center justify-center overflow-hidden mb-2">
              <User className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 text-base text-center">
              {person?.user.name ?? ""}
            </h3>
            <p className="text-xs text-blue-700 font-medium uppercase">
              {isStudent ? "Student" : data.staff?.designation ?? ""}
            </p>
          </div>

          <div className="px-4 space-y-1.5 text-xs">
            {isStudent && cls && (
              <div className="flex justify-between">
                <span className="text-gray-500">Class:</span>
                <span className="font-medium text-gray-800">{cls}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">
                {isStudent ? "Admission No:" : "Staff ID:"}
              </span>
              <span className="font-medium text-gray-800">
                {admissionOrStaffId}
              </span>
            </div>
            {isStudent && data.student?.bloodGroup && (
              <div className="flex justify-between">
                <span className="text-gray-500">Blood Group:</span>
                <span className="font-medium text-gray-800">
                  {data.student.bloodGroup}
                </span>
              </div>
            )}
            {!isStudent && data.staff?.department && (
              <div className="flex justify-between">
                <span className="text-gray-500">Department:</span>
                <span className="font-medium text-gray-800">
                  {data.staff.department}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Contact:</span>
              <span className="font-medium text-gray-800">
                {isStudent
                  ? data.student?.contactNo ?? "—"
                  : data.staff?.phone ?? "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Address:</span>
              <span className="font-medium text-gray-800 text-right max-w-[200px] truncate">
                {isStudent ? data.student?.address ?? "—" : data.staff?.address ?? "—"}
              </span>
            </div>
          </div>

          <div className="mt-auto border-t border-gray-200 px-4 py-2 text-[10px] text-gray-500">
            <div className="flex justify-between">
              <span>Card No: {data.cardNo}</span>
              {data.expiryDate && (
                <span>
                  Exp:{" "}
                  {new Date(data.expiryDate).toLocaleDateString("en-IN")}
                </span>
              )}
            </div>
            <div className="text-center mt-1">
              Issued:{" "}
              {new Date(data.issueDate).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          {data.qrData && (
            <div className="flex justify-center pb-2">
              <Image
                src={data.qrData}
                alt="QR Code"
                width={48}
                height={48}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
