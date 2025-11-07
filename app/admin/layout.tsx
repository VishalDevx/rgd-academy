import getServerSession from "next-auth";
import { authConfig } from "@/app/lib/auth";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const rawSession = await getServerSession(authConfig);
  const session = rawSession as unknown as Session | null;

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return <>{children}</>;
}
