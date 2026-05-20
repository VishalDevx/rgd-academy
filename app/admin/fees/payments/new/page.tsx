"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { Checkbox } from "@/app/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"

interface Student {
  id: string
  name: string
  class: { name: string }
  admissionNo: string | null
}

interface FeeStructure {
  id: string
  name: string | null
  monthlyFee: number
  totalMonths: number
  total: number
  transportFee: number | null
}

interface PaymentStatus {
  feeMonth: number
  status: string
  amountPaid: number
  remainAmount: number
}

export default function NewPaymentPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [structures, setStructures] = useState<FeeStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatus[]>([])
  const [selectedMonths, setSelectedMonths] = useState<number[]>([])

  const [form, setForm] = useState({
    studentId: "",
    feeStructureId: "",
    amountPaid: "",
    discount: "0",
    lateFine: "0",
    paymentMode: "CASH",
    paymentDate: new Date().toISOString().split("T")[0],
    receiptNo: "",
    remarks: "",
  })

  useEffect(() => {
    Promise.all([
      fetch("/api/students?active=true").then((r) => r.json()),
      fetch("/api/fees/structures").then((r) => r.json()),
    ])
      .then(([studentsData, structuresData]) => {
        setStudents(studentsData.students || studentsData)
        setStructures(structuresData)
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false))
  }, [])

  const selectedStructure = structures.find((s) => s.id === form.feeStructureId)
  const monthlyAmount = selectedStructure?.monthlyFee ?? 0

  const fetchPaymentStatus = async (studentId: string, structureId: string) => {
    try {
      const res = await fetch(`/api/fees/slip?studentId=${studentId}`)
      if (!res.ok) return
      const data = await res.json()
      const structureSlip = data.feeSlip?.find(
        (s: { structureId: string }) => s.structureId === structureId
      )
      if (structureSlip) {
        setPaymentStatuses(structureSlip.payments || [])
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (form.studentId && form.feeStructureId) {
      setSelectedMonths([])
      setPaymentStatuses([])
      fetchPaymentStatus(form.studentId, form.feeStructureId)
    }
  }, [form.studentId, form.feeStructureId])

  const toggleMonth = (month: number) => {
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const basePayload = {
        studentId: form.studentId,
        feeStructureId: form.feeStructureId,
        amountPaid: parseFloat(form.amountPaid),
        discount: parseFloat(form.discount) || 0,
        lateFine: parseFloat(form.lateFine) || 0,
        paymentMode: form.paymentMode,
        paymentDate: form.paymentDate,
        receiptNo: form.receiptNo,
        remarks: form.remarks,
      }

      if (selectedMonths.length === 0) {
        const res = await fetch("/api/fees/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(basePayload),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Payment failed")
        }
      } else {
        const perMonthAmount = parseFloat(form.amountPaid) / selectedMonths.length
        for (const month of selectedMonths) {
          const res = await fetch("/api/fees/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...basePayload, amountPaid: perMonthAmount, feeMonth: month }),
          })
          if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || `Payment failed for month ${month}`)
          }
        }
      }

      toast.success("Payment recorded successfully")
      router.push("/admin/fees/payments")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record payment")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Record Payment</h1>
        <p className="text-sm text-muted-foreground">
          Record a fee payment for a student
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            Select student and fee structure, then enter payment amount
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student</Label>
                <Select
                  value={form.studentId}
                  onValueChange={(v) => setForm({ ...form, studentId: v })}
                  required
                >
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} - {s.class.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="structure">Fee Structure</Label>
                <Select
                  value={form.feeStructureId}
                  onValueChange={(v) => setForm({ ...form, feeStructureId: v })}
                  required
                >
                  <SelectTrigger id="structure">
                    <SelectValue placeholder="Select structure" />
                  </SelectTrigger>
                  <SelectContent>
                    {structures.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name || "Untitled"} (₹{s.monthlyFee}/mo × {s.totalMonths})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount Paid (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amountPaid}
                  onChange={(e) => setForm({ ...form, amountPaid: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMode">Payment Mode</Label>
                <Select
                  value={form.paymentMode}
                  onValueChange={(v) => setForm({ ...form, paymentMode: v })}
                >
                  <SelectTrigger id="paymentMode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="BANK">Bank Transfer</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Discount (₹)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lateFine">Late Fine (₹)</Label>
                <Input
                  id="lateFine"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={form.lateFine}
                  onChange={(e) => setForm({ ...form, lateFine: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={form.paymentDate}
                  onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiptNo">Receipt No (optional)</Label>
                <Input
                  id="receiptNo"
                  placeholder="Auto-generated"
                  value={form.receiptNo}
                  onChange={(e) => setForm({ ...form, receiptNo: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="remarks">Remarks (optional)</Label>
                <Input
                  id="remarks"
                  placeholder="Any notes"
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                />
              </div>
            </div>

            {selectedStructure && paymentStatuses.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Payment Status by Month</Label>
                  <span className="text-sm text-muted-foreground">
                    Monthly fee: ₹{monthlyAmount.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {paymentStatuses.map((ps) => (
                    <label
                      key={ps.feeMonth}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors
                        ${
                          selectedMonths.includes(ps.feeMonth)
                            ? "border-primary bg-primary/10"
                            : "hover:bg-muted/50"
                        }
                        ${ps.status === "PAID" ? "opacity-50 pointer-events-none" : ""}
                      `}
                    >
                      <Checkbox
                        checked={selectedMonths.includes(ps.feeMonth)}
                        onCheckedChange={() => toggleMonth(ps.feeMonth)}
                        disabled={ps.status === "PAID"}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">Month {ps.feeMonth}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Badge
                            variant="secondary"
                            className={
                              ps.status === "PAID"
                                ? "bg-green-100 text-green-800"
                                : ps.status === "PARTIAL"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {ps.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ₹{ps.remainAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedMonths.length === 0
                    ? "No months selected - amount will be distributed across unpaid months"
                    : `${selectedMonths.length} month(s) selected`}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Payment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
