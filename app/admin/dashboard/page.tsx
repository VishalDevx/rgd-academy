import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";


export default async function AdminDashboardPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div>Welcome {session.user.name}</div>
  );
}
