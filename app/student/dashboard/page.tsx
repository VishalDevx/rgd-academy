import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";


export default async function AdminDashboardPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  return (
    <div>
      STUDENT DASHBOARD
      {session.user.name}
    </div>
  );
}
