import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

function ym(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET() {
  const now = new Date();
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(ym(d));
  }

  const payments = await db.feePayment.findMany({ include: { student: true }, orderBy: { createdAt: "asc" } } as any);
  const expenses = await db.expense.findMany({ orderBy: { date: "asc" } } as any);

  const feesByMonth: Record<string, number> = Object.fromEntries(months.map((m) => [m, 0]));
  for (const p of payments) {
    const d = p.createdAt ? new Date(p.createdAt as any) : now;
    const key = ym(d);
    if (feesByMonth[key] != null) feesByMonth[key] += Number(p.amountPaid as any);
  }

  const expByMonth: Record<string, number> = Object.fromEntries(months.map((m) => [m, 0]));
  for (const e of expenses) {
    const d = e.date ? new Date(e.date as any) : now;
    const key = ym(d);
    if (expByMonth[key] != null) expByMonth[key] += Number(e.amount as any);
  }

  const data = {
    months,
    fees: months.map((m) => feesByMonth[m] || 0),
    expenses: months.map((m) => expByMonth[m] || 0),
  };

  return NextResponse.json(data);
}


