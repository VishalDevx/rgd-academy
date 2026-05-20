import { getServerSession } from "next-auth/next"
import { authOption } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { FeeSlipClient } from "@/app/components/FeeSlipClient"

export default async function StudentFeeSlipPage({ params }: { params: Promise<{ studentId: string }> }) {
  const session = await getServerSession(authOption)
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const { studentId } = await params
  return <FeeSlipClient studentId={studentId} />
}
