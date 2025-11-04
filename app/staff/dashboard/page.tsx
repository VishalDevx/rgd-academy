
export const dynamic = "force-dynamic";
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function StaffDashboard() {
  const session = await auth()

  if (!session?.user) redirect("/login")
  if (session.user.role !== "STAFF") redirect("/login")

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">STAFF Dashboard</h1>
      <p>Welcome, {session.user.name}</p>
    </div>
  )
}

