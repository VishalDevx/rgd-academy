import DashboardClient from "@/app/components/DashboardClient";

export default function AdminDashboardPage() {
  // No need to fetch session here — layout already enforces admin access
  return <DashboardClient />;
}
