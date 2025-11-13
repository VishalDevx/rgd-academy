import Link from "next/link";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import getServerSession from "next-auth/next";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminFeesPage() {
  const session = await getServerSession(authConfig);
if (!session?.user || session.user.role !== "ADMIN") {
  redirect("/login"); 
  return;           
}


  const [structures, payments] = await Promise.all([
    db.feeStructure.findMany({ include: { class: true }, orderBy: { createdAt: "desc" } }),
    db.feePayment.findMany({ include: { student: { include: { user: true } }, feeStructure: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-8">
      {/* Fee Structures Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Fee Structures</h2>
          <Link href="/admin/fees/structures/new" className="px-3 py-2 rounded bg-blue-600 text-white text-sm">New Structure</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2 border">Class</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Total</th>
              </tr>
            </thead>
            <tbody>
              {structures.map((s) => (
                <tr key={s.id}>
                  <td className="p-2 border">{s.class?.name}</td>
                  <td className="p-2 border">{s.name ?? "-"}</td>
                  <td className="p-2 border">{s.total.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fee Payments Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Payments</h2>
          <Link href="/admin/fees/payments/new" className="px-3 py-2 rounded bg-blue-600 text-white text-sm">Record Payment</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2 border">Student</th>
                <th className="p-2 border">Structure</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="p-2 border">{p.student.user.name}</td>
                  <td className="p-2 border">{p.feeStructure.name ?? p.feeStructure.id}</td>
                  <td className="p-2 border">{p.amountPaid.toString()}</td>
                  <td className="p-2 border">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
