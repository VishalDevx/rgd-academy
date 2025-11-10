import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";


export default async function StaffDashboardPage() {
  const session = await getServerSession(authConfig);

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
