import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { TransactionType } from "@prisma/client";
import { authOption } from "@/app/lib/auth";

interface CreateExpenseBody {
  title: string;
  description?: string | null;
  amount: number | string;
  date?: string | null;
  transaction?: TransactionType;  // allow user to send it
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOption);

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body: CreateExpenseBody | null = await req.json().catch(() => null);

  if (!body || !body.title || body.amount == null) {
    return new NextResponse("Invalid payload", { status: 400 });
  }

  const normalizedAmount = Number(body.amount);
  if (Number.isNaN(normalizedAmount)) {
    return new NextResponse("Invalid amount", { status: 400 });
  }

  const created = await db.expense.create({
    data: {
      title: body.title,
      description: body.description ?? null,
      amount: normalizedAmount.toFixed(2),

      transaction: body.transaction ?? TransactionType.DEBIT, // default

      date: body.date ? new Date(body.date) : new Date(),
      createdById: session.user.id,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
