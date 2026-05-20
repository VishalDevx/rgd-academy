"use client";
import ExpenseDashboard, { type Expense as ChartExpense } from "@/app/components/charts/ExpenseCharts";

export default function ExpenseDashboardClient({ expenses }: { expenses: ChartExpense[] }) {
  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">
          Expense Dashboard
        </h1>
        <p className="text-gray-700 text-sm md:text-base">
          Track all school expenses and income with trends and insights
        </p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <ExpenseDashboard expenses={expenses} />
      </div>
    </div>
  );
}
