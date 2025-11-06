// app/admin/dashboard/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import DashboardClient from "@/app/components/DashboardClient";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  return <DashboardClient />;
}
