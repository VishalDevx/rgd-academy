"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Image from "next/image";

type ReceiptPayload = {
  school: null | {
    name: string;
    address: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    logoUrl: string | null;
  };
  payment: {
    id: string;
    amountPaid: string | number;
    remainAmount: string | number;
    status: "PENDING" | "PARTIAL" | "PAID";
    paymentDate: string | null;
    createdAt: string;
    razorpayOrder: string | null;
    razorpayPaymentId: string | null;
    receiptUrl: string | null;
    feeStructure: {
      id: string;
      name: string | null;
      total: string | number;
    };
    student: {
      id: string;
      admissionNo: string;
      rollNumber: string;
      user: { name: string; email: string; phone: string | null };
      class: { name: string; grade: string; section: string | null } | null;
    };
  };
};

function n(v: string | number) {
  const num = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(num) ? num : 0;
}

function fmtDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

export function FeeReceiptClient({ paymentId }: { paymentId: string }) {
  const [data, setData] = useState<ReceiptPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!paymentId) return;
    fetch(`/api/fees/payments/${paymentId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Failed");
        return res.json();
      })
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [paymentId]);

  const computed = useMemo(() => {
    if (!data) return null;
    const total = n(data.payment.feeStructure.total);
    const paid = n(data.payment.amountPaid);
    const remain = n(data.payment.remainAmount);
    const status = data.payment.status;
    return { total, paid, remain, status };
  }, [data]);

  const handleDownload = async () => {
    if (!receiptRef.current || !data) return;

    const canvas = await html2canvas(receiptRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    const safeName = data.payment.student.user.name.replaceAll(" ", "_");
    pdf.save(`${safeName}_Fee_Receipt_${data.payment.id}.pdf`);
  };

  if (loading) return <div className="py-12 text-center text-gray-500">Loading…</div>;
  if (error) return <div className="py-12 text-center text-red-600">{error}</div>;
  if (!data || !computed) return null;

  const schoolName = data.school?.name ?? "School";
  const receiptNo = data.payment.id;
  const studentClass = data.payment.student.class?.name ?? "—";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 bg-gray-100">
      <div className="flex items-center justify-end gap-3 mb-4">
        <button
          onClick={() => window.print()}
          className="rounded-md border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          Print
        </button>
        <button
          onClick={handleDownload}
          className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Download PDF
        </button>
      </div>

      <div ref={receiptRef} className="bg-white p-8 md:p-10 text-gray-900">
        {/* Header */}
        <div className="flex items-start gap-4 border-b pb-6 mb-6">
          {data.school?.logoUrl ? (
            <div className="relative h-14 w-14">
              <Image
                src={data.school.logoUrl}
                alt={`${schoolName} logo`}
                fill
                className="object-contain"
                sizes="56px"
                priority
              />
            </div>
          ) : null}

          <div className="flex-1">
            <h1 className="text-2xl font-extrabold tracking-wide">{schoolName}</h1>
            {data.school?.address ? (
              <p className="text-sm text-gray-700 mt-1">{data.school.address}</p>
            ) : null}
            <p className="text-xs text-gray-600 mt-2">
              Fee Receipt • Receipt No: <span className="font-semibold">{receiptNo}</span>
            </p>
          </div>

          <div className="text-right text-xs text-gray-600">
            <div>Date: {fmtDate(data.payment.paymentDate ?? data.payment.createdAt)}</div>
            <div>Status: {data.payment.status}</div>
          </div>
        </div>

        {/* Student + payment info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
          <Info label="Student Name" value={data.payment.student.user.name} />
          <Info label="Admission No" value={data.payment.student.admissionNo} />
          <Info label="Roll Number" value={data.payment.student.rollNumber} />
          <Info label="Class" value={studentClass} />
          <Info label="Email" value={data.payment.student.user.email} />
          <Info label="Phone" value={data.payment.student.user.phone ?? "—"} />
        </div>

        <div className="border rounded-md overflow-hidden">
          <div className="grid grid-cols-4 bg-gray-100 text-xs font-semibold uppercase tracking-wider">
            <Cell head>Fee Structure</Cell>
            <Cell head className="text-right">
              Total
            </Cell>
            <Cell head className="text-right">
              Paid
            </Cell>
            <Cell head className="text-right">
              Remaining
            </Cell>
          </div>
          <div className="grid grid-cols-4 text-sm">
            <Cell>{data.payment.feeStructure.name ?? "—"}</Cell>
            <Cell className="text-right">₹{computed.total.toLocaleString()}</Cell>
            <Cell className="text-right">₹{computed.paid.toLocaleString()}</Cell>
            <Cell className="text-right">₹{computed.remain.toLocaleString()}</Cell>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-600">
          {data.payment.razorpayPaymentId ? (
            <div>Online Payment Id: {data.payment.razorpayPaymentId}</div>
          ) : null}
          {data.payment.receiptUrl ? <div>Receipt URL: {data.payment.receiptUrl}</div> : null}
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 text-sm">
          <Signature label="Collected By" />
          <Signature label="Authorized Signatory" />
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border px-4 py-3">
      <p className="text-xs uppercase tracking-widest text-gray-600">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function Cell({
  children,
  head,
  className,
}: {
  children: React.ReactNode;
  head?: boolean;
  className?: string;
}) {
  return (
    <div
      className={[
        "px-4 py-3 border-r last:border-r-0",
        head ? "border-b" : "",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function Signature({ label }: { label: string }) {
  return (
    <div>
      <div className="h-12 border-b mb-2" />
      <div className="text-xs uppercase tracking-widest text-gray-600">{label}</div>
    </div>
  );
}

