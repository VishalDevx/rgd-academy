import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOption } from "@/app/lib/auth";


export default async function StaffDashboardPage() {
  const session = await getServerSession(authOption);

  if (!session?.user || session.user.role !== "STAFF") {
    redirect("/login");
  }

  return (
    <div>
      STAFF  DASHBOARD
      {session.user.name}
    </div>
  );
}
