'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/app/components/ui/badge'
import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from '@/app/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'

// Strongly typed payment
type NormalizedPayment = {
  id: string
  amountPaid: string | number
  remainAmount: string | number
  status: 'PAID' | 'PARTIAL' | 'PENDING'
  paymentDate: string | null
  createdAt: string
  student: {
    id: string
    admissionNo: string
    rollNumber: string
    user: {
      name: string
      email: string
    }
    class: { name: string } | null
  }
  feeStructure: {
    name: string | null
    total: string | number
  }
}

export default function AdminPaymentPage() {
  const searchParams = useSearchParams()
  const pageParam = searchParams?.get('page')
  const currentPage = Number(pageParam ?? '1')
  const pageSize = 15
  const [payments, setPayments] = useState<NormalizedPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/fees/payments')
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? 'Failed')
        return res.json()
      })
      .then((rows: NormalizedPayment[]) => setPayments(Array.isArray(rows) ? rows : []))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false))
  }, [])

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(payments.length / pageSize))
  }, [payments.length, pageSize])

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return payments.slice(start, start + pageSize)
  }, [payments, currentPage, pageSize])

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold">All Payments</h1>

      <Card>
        <CardHeader>
          <CardTitle>Payments Table</CardTitle>
          <CardDescription>
            Showing page {currentPage} of {totalPages}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? <div className="py-8 text-center text-gray-500">Loading…</div> : null}
          {error ? <div className="py-8 text-center text-red-600">{error}</div> : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Structure</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paged.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.student.user.name}</TableCell>
                  <TableCell>{p.student.user.email}</TableCell>
                  <TableCell>{p.feeStructure.name}</TableCell>
                  <TableCell>
                    {new Date(p.paymentDate ?? p.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{Number(p.amountPaid).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        p.status === 'PAID'
                          ? 'secondary'
                          : p.status === 'PARTIAL'
                          ? 'outline'
                          : 'destructive'
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      className="text-sm font-semibold underline underline-offset-4"
                      href={`/admin/fees/payments/${p.id}/receipt`}
                    >
                      Receipt
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-6 flex justify-center gap-2">
            <Link
              href={`/admin/fees/payments?page=${Math.max(currentPage - 1, 1)}`}
              className={`px-3 py-1 rounded-md border ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Previous
            </Link>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/admin/fees/payments?page=${page}`}
                className={`px-3 py-1 rounded-full border ${
                  page === currentPage ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                }`}
              >
                {page}
              </Link>
            ))}

            <Link
              href={`/admin/fees/payments?page=${Math.min(currentPage + 1, totalPages)}`}
              className={`px-3 py-1 rounded-md border ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Next
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
