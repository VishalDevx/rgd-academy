import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOption } from "@/app/lib/auth";
import { FeeSlipClient } from "@/app/components/FeeSlipClient";

export default async function AdminFeeSlipPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const session = await getServerSession(authOption);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const { studentId } = await params;

  return <FeeSlipClient studentId={studentId} />;
}
