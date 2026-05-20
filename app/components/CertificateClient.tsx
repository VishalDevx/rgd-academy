"use client";

import { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Loader2, Download, Printer } from "lucide-react";
import Image from "next/image";

interface CertificateData {
  id: string;
  certificateNo: string;
  type: string;
  issueDate: string;
  content: Record<string, string>;
  remarks: string | null;
  student?: {
    user: { name: string };
    class: { name: string } | null;
    admissionNo: string;
  };
  staff?: {
    user: { name: string };
    designation: string;
  };
}

export function CertificateClient({ certificateId }: { certificateId: string }) {
  const [data, setData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/certificates/${certificateId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [certificateId]);

  const downloadPDF = async () => {
    if (!certRef.current) return;
    setPdfLoading(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`certificate-${data?.certificateNo ?? certificateId}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setPdfLoading(false);
    }
  };

  const printCertificate = () => {
    if (!certRef.current) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Certificate</title>
          <style>
            body { margin: 0; padding: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${certRef.current.innerHTML}</body>
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
      <div className="text-center py-12 text-gray-500">
        Certificate not found
      </div>
    );
  }

  const isStudent = !!data.student;
  const personName = isStudent
    ? (data.content?.studentName ?? data.student?.user.name ?? "")
    : (data.content?.staffName ?? data.staff?.user.name ?? "");

  const typeLabel = data.type.replace(/_/g, " ");

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
        <Button variant="outline" onClick={printCertificate}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      <div ref={certRef}>
        <Card className="p-12 border-2 border-yellow-600 bg-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-bold text-yellow-600 rotate-[-30deg]">
              KakshaOne
            </div>
          </div>

          <div className="text-center mb-8 relative">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.jpeg"
                alt="School Logo"
                width={80}
                height={80}
                className="rounded-full"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-1">
              R. G. D. Academy
            </h1>
            <p className="text-sm text-gray-500">
              Affiliated to CBSE, New Delhi
            </p>
            <div className="w-32 h-1 bg-yellow-600 mx-auto mt-4 mb-6" />
            <h2 className="text-2xl font-semibold text-yellow-700 uppercase tracking-wider">
              {typeLabel} Certificate
            </h2>
          </div>

          <div className="text-sm text-gray-600 mb-6 space-y-1">
            <p>
              <span className="font-semibold">Certificate No:</span>{" "}
              {data.certificateNo}
            </p>
            <p>
              <span className="font-semibold">Date of Issue:</span>{" "}
              {new Date(data.issueDate).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="text-justify text-gray-700 leading-relaxed mb-8 space-y-3">
            <p>
              This is to certify that{" "}
              <span className="font-bold text-gray-900">{personName}</span>
              {isStudent ? (
                <>
                  {data.content?.fatherName && (
                    <> S/o {data.content.fatherName}</>
                  )}
                  {data.content?.motherName && (
                    <>, M/o {data.content.motherName}</>
                  )}
                  , is a student of this institution studying in{" "}
                  <span className="font-semibold">
                    Class {data.content?.class}
                  </span>{" "}
                  (Admission No: {data.content?.admissionNo}).
                </>
              ) : (
                <>
                  , is working as{" "}
                  <span className="font-semibold">
                    {data.content?.designation}
                  </span>
                  {data.content?.department && (
                    <> in the Department of {data.content.department}</>
                  )}
                  .
                </>
              )}
            </p>
            <p>
              This certificate is issued for the purpose of{" "}
              {data.remarks ?? "official requirements"}.
            </p>
            <p>
              We wish {isStudent ? "him/her" : "him/her"} all the best in
              {isStudent ? " his/her" : " his/her"} future endeavors.
            </p>
          </div>

          <div className="grid grid-cols-2 items-end mt-12">
            <div className="text-center">
              <div className="w-48 border-t-2 border-gray-400 mx-auto mb-1" />
              <p className="text-sm font-medium text-gray-700">Principal</p>
            </div>
            <div className="text-center">
              <div className="w-48 border-t-2 border-gray-400 mx-auto mb-1" />
              <p className="text-sm font-medium text-gray-700">School Seal</p>
            </div>
          </div>

          {data.remarks && (
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-600">
              <span className="font-semibold">Remarks:</span> {data.remarks}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
