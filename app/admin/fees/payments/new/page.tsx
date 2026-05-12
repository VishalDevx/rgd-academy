"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { toast } from "sonner";

interface Student {
  id: string;
  user: { name: string };
  usesTransport: boolean;
  classId: string;
}

interface FeeStructure {
  id: string;
  name: string;
  total: number;
  transportFee: number | null;
  classId: string;
  class?: { name: string };
}

export default function NewFeePaymentPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStructureId, setSelectedStructureId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [discount, setDiscount] = useState("");
  const [lateFine, setLateFine] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedStructure = structures.find(s => s.id === selectedStructureId);

  let adjustedTotal = 0;
  if (selectedStructure) {
    adjustedTotal = Number(selectedStructure.total);
    if (selectedStructure.transportFee && selectedStudent && !selectedStudent.usesTransport) {
      adjustedTotal -= Number(selectedStructure.transportFee);
    }
  }

  const paidAmount = Number(amountPaid) || 0;
  const discAmount = Number(discount) || 0;
  const lateAmount = Number(lateFine) || 0;
  const netAmount = paidAmount + discAmount - lateAmount;
  const remaining = Math.max(adjustedTotal - netAmount, 0);
  const autoStatus = netAmount >= adjustedTotal ? "PAID" : netAmount > 0 ? "PARTIAL" : "PENDING";

  useEffect(() => {
    fetch("/api/students")
      .then((res) => res.json())
      .then((data: Student[]) => setStudents(data))
      .catch(() => toast.error("Failed to load students"));

    fetch("/api/fees/structures")
      .then((res) => res.json())
      .then((data: FeeStructure[]) => setStructures(data))
      .catch(() => toast.error("Failed to load fee structures"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedStructureId || !amountPaid) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/fees/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          feeStructureId: selectedStructureId,
          amountPaid,
          paymentMode,
          discount: discount || "0",
          lateFine: lateFine || "0",
          remarks,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      toast.success("Payment recorded successfully!");
      router.push("/admin/fees/payments");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving payment";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Record Fee Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Student</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId} required>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fee Structure</Label>
                <Select value={selectedStructureId} onValueChange={setSelectedStructureId} required>
                  <SelectTrigger><SelectValue placeholder="Select structure" /></SelectTrigger>
                  <SelectContent>
                    {structures.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name || s.id} — ₹{Number(s.total).toLocaleString()}
                        {s.class?.name ? ` (${s.class.name})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expected Amount Display */}
            {selectedStructure && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-blue-600 text-xs font-medium">Expected Total</p>
                  <p className="text-lg font-bold text-blue-800">₹{adjustedTotal.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-blue-600 text-xs font-medium">Transport</p>
                  <p className="font-semibold">
                    {selectedStudent?.usesTransport
                      ? `₹${Number(selectedStructure.transportFee || 0).toLocaleString()}`
                      : "Excluded"}
                  </p>
                </div>
                <div>
                  <p className="text-blue-600 text-xs font-medium">Amount Paying</p>
                  <p className="text-lg font-bold text-green-600">₹{netAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-blue-600 text-xs font-medium">Balance After</p>
                  <p className={`text-lg font-bold ${remaining === 0 ? "text-green-600" : "text-red-600"}`}>
                    ₹{remaining.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Amount Paid *</Label>
                <Input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} required min="0" />
              </div>
              <div>
                <Label>Payment Mode</Label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["CASH", "UPI", "CARD", "BANK", "CHEQUE", "ONLINE"].map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Discount</Label>
                <Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} min="0" placeholder="0" />
              </div>
              <div>
                <Label>Late Fine</Label>
                <Input type="number" value={lateFine} onChange={(e) => setLateFine(e.target.value)} min="0" placeholder="0" />
              </div>
              <div className="md:col-span-2">
                <Label>Remarks</Label>
                <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional remarks" />
              </div>
            </div>

            {/* Auto Status Display */}
            {Number(amountPaid) > 0 && (
              <div className={`p-3 rounded-lg text-sm font-semibold text-center ${
                autoStatus === "PAID" ? "bg-green-100 text-green-700" :
                autoStatus === "PARTIAL" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                Status: {autoStatus} — ₹{netAmount.toLocaleString()} paid of ₹{adjustedTotal.toLocaleString()}
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
