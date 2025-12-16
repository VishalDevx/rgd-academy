"use client";
import { motion } from "framer-motion";
import ExpenseDashboard from "@/app/components/charts/ExpenseCharts";

export default function ExpenseDashboardClient({ expenses }: { expenses: any[] }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-white to-pink-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
      >
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
          Expense Dashboard
        </h1>
        <p className="text-gray-700 text-sm md:text-base">
          Track all school expenses with trends and insights
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl p-6 hover:shadow-3xl hover:scale-[1.02] transition-transform duration-300"
      >
        <ExpenseDashboard expenses={expenses} />
      </motion.div>
    </div>
  );
}
