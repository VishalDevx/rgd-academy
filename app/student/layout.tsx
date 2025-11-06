import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Sidebar } from "@/app/components/Sidebar";
import { Suspense } from "react";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") redirect("/login");

  return (
    <div className="flex">
      <Sidebar role="STUDENT" />
      <main className="flex-1 min-h-screen bg-gray-50">
        <div className="p-6">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}


