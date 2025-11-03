"use client";
import { useSession } from "next-auth/react";

export default function StaffDashboard() {
  const { data: session } = useSession();

  if (!session) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Staff Dashboard</h1>
      <p>Welcome, {session.user?.name}</p>
    </div>
  );
}
