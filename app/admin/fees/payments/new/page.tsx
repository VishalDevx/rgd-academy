"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { toast } from "sonner";

interface FeePaymentForm {
  studentId: string;
  feeStructureId: string;
  amountPaid: string;
  status: "PAID" | "PARTIAL" | "PENDING";
}

interface Student {
  id: string;
  user: { name: string };
}

interface FeeStructure {
  id: string;
  name: string;
}

export default function NewFeePaymentPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [form, setForm] = useState<FeePaymentForm>({
    studentId: "",
    feeStructureId: "",
    amountPaid: "",
    status: "PAID",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const onChange = (key: keyof FeePaymentForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/fees/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Payment recorded successfully!");
      router.push("/admin/fees");
    } catch (err: any) {
      const msg = err.message || "Failed to save payment";
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
              {/* Student Select */}
              <div>
                <Label htmlFor="studentId">Student</Label>
                <Select
                  value={form.studentId}
                  onValueChange={(val) => onChange("studentId", val)}
                  required
                >
                  <SelectTrigger id="studentId">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fee Structure Select */}
              <div>
                <Label htmlFor="feeStructureId">Fee Structure</Label>
                <Select
                  value={form.feeStructureId}
                  onValueChange={(val) => onChange("feeStructureId", val)}
                  required
                >
                  <SelectTrigger id="feeStructureId">
                    <SelectValue placeholder="Select structure" />
                  </SelectTrigger>
                  <SelectContent>
                    {structures.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name ?? s.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Paid */}
              <div>
                <Label htmlFor="amountPaid">Amount Paid</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  value={form.amountPaid}
                  onChange={(e) => onChange("amountPaid", e.target.value)}
                  required
                />
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => onChange("status", val)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">PAID</SelectItem>
                    <SelectItem value="PARTIAL">PARTIAL</SelectItem>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
