import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authConfig);

  // 🔒 Block access if not logged in or not an ADMIN
  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  return <>{children}</>;
}





