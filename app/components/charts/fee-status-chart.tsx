"use client";
import React from "react";

interface FeeStatusChartProps {
  paid: number;
  outstanding: number;
}

export const FeeStatusChart: React.FC<FeeStatusChartProps> = ({ paid, outstanding }) => {
  return (
    <div className="w-full h-64 flex items-center justify-center border rounded-md">
      {/* Replace with actual chart library like Recharts or Chart.js */}
      <p>
        Paid: ₹{paid.toLocaleString()} | Outstanding: ₹{outstanding.toLocaleString()}
      </p>
    </div>
  );
};
