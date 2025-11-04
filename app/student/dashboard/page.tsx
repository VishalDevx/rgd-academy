// app/admin/dashboard/page.tsx
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function StudentDashboard() {
  const session = await auth()

  if (!session?.user) redirect("/login")
  if (session.user.role !== "STUDENT") redirect("/login")

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Student Dashboard</h1>
      <p>Welcome, {session.user.name}</p>
    </div>
  )
}

