"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      <AnalyticsSection />
    </div>
  );
}



import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function AnalyticsSection() {
  const [data, setData] = useState<{ months: string[]; fees: number[]; expenses: number[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/analytics/summary");
        const json = await res.json();
        setData(json);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading charts...</div>;
  if (!data) return <div>No data</div>;

  const feesVsExpenses = {
    labels: data.months,
    datasets: [
      { label: "Fees Collected", data: data.fees, borderColor: "#16a34a", backgroundColor: "#16a34a33" },
      { label: "Expenses", data: data.expenses, borderColor: "#dc2626", backgroundColor: "#dc262633" },
    ],
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white p-4 rounded border">
        <h2 className="font-semibold mb-2">Fees vs Expenses (Last 6 months)</h2>
        <Line data={feesVsExpenses} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
      </div>
    </div>
  );
}
