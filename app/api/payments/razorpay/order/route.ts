import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/app/api/auth/[...nextauth]/route";

const key_id = process.env.RAZORPAY_KEY_ID as string | undefined;
const key_secret = process.env.RAZORPAY_KEY_SECRET as string | undefined;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  if (!key_id || !key_secret) return new NextResponse("Razorpay not configured", { status: 500 });

  const body = await req.json().catch(() => null);
  if (!body || body.amount == null || !body.currency) return new NextResponse("Invalid payload", { status: 400 });

  const instance = new Razorpay({ key_id, key_secret });
  try {
    const order = await instance.orders.create({
      amount: Math.round(Number(body.amount) * 100), // INR paise
      currency: body.currency,
      receipt: body.receipt ?? `rcpt_${Date.now()}`,
      notes: body.notes ?? {},
    });
    return NextResponse.json(order);
  } catch (e: any) {
    return new NextResponse(e?.message ?? "Failed to create order", { status: 500 });
  }
}


