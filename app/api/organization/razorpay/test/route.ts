import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOption } from "@/app/lib/auth"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOption)
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { razorpayKeyId, razorpayKeySecret } = await req.json()
  if (!razorpayKeyId || !razorpayKeySecret) {
    return NextResponse.json({ error: "Both Key ID and Key Secret are required" }, { status: 400 })
  }

  try {
    const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64")
    const res = await fetch("https://api.razorpay.com/v1/payments?count=1", {
      headers: { Authorization: `Basic ${auth}` },
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json(
        { valid: false, error: (err as { error?: { description?: string } })?.error?.description || "Invalid keys" },
        { status: 200 }
      )
    }

    const accountRes = await fetch("https://api.razorpay.com/v1/account", {
      headers: { Authorization: `Basic ${auth}` },
    })
    let accountName = ""
    if (accountRes.ok) {
      const account = await accountRes.json()
      accountName = (account as { business_name?: string })?.business_name || ""
    }

    return NextResponse.json({ valid: true, accountName })
  } catch {
    return NextResponse.json({ valid: false, error: "Could not connect to Razorpay" }, { status: 200 })
  }
}
