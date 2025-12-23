import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOption } from "@/app/lib/auth";
import MarksheetClient from "@/app/components/MarksheetClient";

export default async function StaffMarksheetPage({
  params,
}: {
  params: { studentId: string };
}) {
  const session = await getServerSession(authOption);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "STAFF") {
    redirect("/");
  }

  return <MarksheetClient studentId={params.studentId} />;
}
