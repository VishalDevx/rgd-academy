import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/prisma";
import Link from "next/link";

// UI Components
import { Badge } from "@/app/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

function normalizePayment(p: any) {
  return {
    ...p,
    amountPaid: Number(p.amountPaid),
    feeStructure: {
      ...p.feeStructure,
      total: Number(p.feeStructure.total),
    },
  };
}
export default async function AdminPaymentPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authConfig);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  // ✅ Correct way: access searchParams as object
  let currentPage = 1;
  if (searchParams?.page) {
    if (Array.isArray(searchParams.page)) currentPage = Number(searchParams.page[0]);
    else currentPage = Number(searchParams.page);
  }

  const pageSize = 15;
  const skip = (currentPage - 1) * pageSize;

  const [paymentsRaw, totalCount] = await Promise.all([
    db.feePayment.findMany({
      include: { student: { include: { user: true } }, feeStructure: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.feePayment.count(),
  ]);

  const payments = paymentsRaw.map((p) => ({
    ...p,
    amountPaid: Number(p.amountPaid),
    feeStructure: { ...p.feeStructure, total: Number(p.feeStructure.total) },
  }));

  const totalPages = Math.ceil(totalCount / pageSize);

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
                <TableHead>Fee Structure</TableHead>
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
                    <Badge variant={p.status === "PAID" ? "secondary" : "destructive"}>
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
              className={`px-3 py-1 rounded-md border font-medium ${
                currentPage === 1
                  ? "text-gray-400 border-gray-300 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Previous
            </Link>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/admin/fees/payments?page=${page}`}
                className={`px-3 py-1 rounded-full border font-medium ${
                  page === currentPage
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {page}
              </Link>
            ))}

            <Link
              href={`/admin/fees/payments?page=${Math.min(currentPage + 1, totalPages)}`}
              className={`px-3 py-1 rounded-md border font-medium ${
                currentPage === totalPages
                  ? "text-gray-400 border-gray-300 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Next
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
