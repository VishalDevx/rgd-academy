import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOption } from "@/app/lib/auth";


export default async function StudentDashboardPage() {
  const session = await getServerSession(authOption);

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
