
import { auth } from "@/app/api/auth/[...nextauth]/route";
import DashboardClient from "@/app/components/DashboardClient";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth(); // ✅ async, keep await

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login"); // ✅ server-side redirect
  }

  return <DashboardClient/>;
}
