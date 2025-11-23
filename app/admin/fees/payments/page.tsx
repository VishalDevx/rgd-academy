'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/app/components/ui/badge'
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
  amountPaid: number
  status: 'PAID' | 'PARTIAL' | 'UNPAID'
  createdAt: Date
  student: {
    user: {
      name: string
      email: string
    }
  }
  feeStructure: {
    name: string | null
    total: number
  }
}

// Dummy data for client-side demo (replace with API call)
const dummyPayments: NormalizedPayment[] = [
  {
    id: '1',
    amountPaid: 5000,
    status: 'PAID',
    createdAt: new Date(),
    student: { user: { name: 'John Doe', email: 'john@example.com' } },
    feeStructure: { name: 'Monthly Fee', total: 5000 },
  },
  {
    id: '2',
    amountPaid: 2500,
    status: 'PARTIAL',
    createdAt: new Date(),
    student: { user: { name: 'Jane Smith', email: 'jane@example.com' } },
    feeStructure: { name: 'Monthly Fee', total: 5000 },
  },
]

export default function AdminPaymentPage() {
  const searchParams = useSearchParams()
  const pageParam = searchParams?.get('page')
  const currentPage = Number(pageParam ?? '1')
  const pageSize = 15
  const totalPages = 10 // Replace with real total pages from API

  const payments = dummyPayments // Replace with real fetched data

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Structure</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.student.user.name}</TableCell>
                  <TableCell>{p.student.user.email}</TableCell>
                  <TableCell>{p.feeStructure.name}</TableCell>
                  <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">₹{p.amountPaid.toLocaleString()}</TableCell>
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
