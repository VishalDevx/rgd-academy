import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import StudentPasswordManager from "@/app/components/StudentPasswordManager";
import { authOptions } from "@/app/lib/auth";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome {session.user.name}</h1>

      {/* Student password manager section */}
      <StudentPasswordManager />
    </div>
  );
}
