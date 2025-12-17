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
  transaction: TransactionType; // <-- mandatory
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOption);

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Parse JSON body
  const body: CreateExpenseBody | null = await req.json().catch(() => null);
  if (!body) {
    return new NextResponse("Invalid payload", { status: 400 });
  }

  // Validate required fields
  const { title, amount, transaction, description, date } = body;

  if (!title || amount == null || !transaction) {
    return new NextResponse("Title, amount, and transaction are required", { status: 400 });
  }

  // Validate transaction type
  if (!Object.values(TransactionType).includes(transaction)) {
    return new NextResponse("Invalid transaction type", { status: 400 });
  }

  // Normalize amount
  const normalizedAmount = Number(amount);
  if (Number.isNaN(normalizedAmount)) {
    return new NextResponse("Invalid amount", { status: 400 });
  }

  // Create expense
  const created = await db.expense.create({
    data: {
      title,
      description: description ?? null,
      amount: normalizedAmount.toFixed(2),
      transaction,            // now mandatory and validated
      date: date ? new Date(date) : new Date(),
      createdById: session.user.id,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
