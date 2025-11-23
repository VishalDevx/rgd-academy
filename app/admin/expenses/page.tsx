export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import ExpenseDashboard from "@/app/components/charts/ExpenseCharts";
import { authOptions } from "@/app/lib/auth";

export default async function AdminExpensesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  // ---------------- FETCH EXPENSES ----------------
  const raw = await db.expense.findMany({
    orderBy: { date: "desc" },
  });

  // ---------------- SANITIZE FOR CLIENT ----------------
  const expenses = raw.map((x) => ({
    id: x.id,
    title: x.title,
    description: x.description ?? "",
    amount: Number(x.amount),
   
    date: x.date.toISOString(),
  }));

  return <ExpenseDashboard expenses={expenses} />;
}
