export const dynamic = "force-dynamic";
import getServerSession from "next-auth/next"
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminExpensesPage() {
 const session = await getServerSession(authConfig)
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const items = await db.expense.findMany({ orderBy: { date: "desc" } } as any);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Expenses</h1>
        <Link href="/admin/expenses/new" className="px-3 py-2 rounded bg-blue-600 text-white text-sm">New Expense</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e: any) => (
              <tr key={e.id}>
                <td className="p-2 border">{e.title}</td>
                <td className="p-2 border">{e.amount as any}</td>
                <td className="p-2 border">{new Date(e.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


