"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Eye, IndianRupee } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"
import { Badge } from "@/app/components/ui/badge"

const statusStyles: Record<string, string> = {
  PAID: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  PARTIAL: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  PENDING: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

interface Payment {
  id: string
  amountPaid: number
  remainAmount: number
  monthlyFee: number
  feeMonth: number
  status: string
  paymentDate: string | null
  paymentMode: string | null
  discount: number | null
  lateFine: number | null
  receiptNo: string | null
  createdAt: string
  student: {
    id: string
    admissionNo: string | null
    rollNumber: string | null
    user: { name: string | null }
    class: { name: string }
  }
  feeStructure: {
    id: string
    name: string | null
    monthlyFee: number
    totalMonths: number
  } | null
}

export default function FeePaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/fees/payments")
      if (!res.ok) throw new Error("Failed to load")
      setPayments(await res.json())
    } catch {
      toast.error("Failed to load payments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.student.user.name?.toLowerCase().includes(q) ||
      p.receiptNo?.toLowerCase().includes(q) ||
      p.student.class.name.toLowerCase().includes(q) ||
      p.feeStructure?.name?.toLowerCase().includes(q)
    )
  })

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground">
            View and manage all fee payments
          </p>
        </div>
        <Button onClick={() => router.push("/admin/fees/payments/new")}>
          Record Payment
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>All Payments</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            {filtered.length} payment{filtered.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt No</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Structure</TableHead>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">
                      {p.receiptNo || "—"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {p.student.user.name || "Unknown"}
                    </TableCell>
                    <TableCell>{p.student.class.name}</TableCell>
                    <TableCell>{p.feeStructure?.name || "—"}</TableCell>
                    <TableCell>
                      {p.feeMonth ? (
                        <Badge variant="outline">Month {p.feeMonth}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <IndianRupee className="inline h-3 w-3" />
                      {p.amountPaid.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.paymentDate
                        ? new Date(p.paymentDate).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {p.paymentMode ? (
                        <Badge variant="secondary">{p.paymentMode}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusStyles[p.status]} variant="secondary">
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/fees/payments/${p.id}/receipt`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
