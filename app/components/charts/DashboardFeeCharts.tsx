"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { PieChart, Pie, Cell, PieLabelRenderProps } from "recharts";

interface MonthlyFeeStatusProps {
  paid: number; // in absolute amount
  pending: number;
  overdue: number;
  collectionRate: number; // percentage
  totalExpected: number; // in $ or ₹
}

const COLORS = ["#4ade80", "#facc15", "#f87171"];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: PieLabelRenderProps) => {
  if (cx == null || cy == null || innerRadius == null || outerRadius == null) return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  );
};

export function CurrentMonthFeeStatusChart({
  paid,
  pending,
  overdue,
  collectionRate,
  totalExpected,
}: MonthlyFeeStatusProps) {
  const data = [
    { name: "Paid", value: paid },
    { name: "Pending", value: pending },
    { name: "Overdue", value: overdue },
  ];

  return (
    <Card className="w-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Fee Status</CardTitle>
        <p className="text-xs text-gray-500">Current month breakdown</p>
      </CardHeader>

      <CardContent className="flex gap-6 p-4 flex-col items-center">
        {/* Pie Chart */}
        <div className="flex justify-center">
          <PieChart width={140} height={140}>
            <Pie
              data={data}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </div>

        {/* Metrics & legend (line-wise) */}
        <div className="mt-4 w-full text-sm">
          <div className="flex justify-between">
            <span className="font-medium text-green-600">Paid</span>
            <span className="font-semibold text-green-600">{paid.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-yellow-600">Pending</span>
            <span className="font-semibold text-yellow-600">{pending.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-red-600">Overdue</span>
            <span className="font-semibold text-red-600">{overdue.toLocaleString()}</span>
          </div>

          <hr className="my-2 border-gray-200" />

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Collection Rate</span>
            <span className="font-semibold">{collectionRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Total Expected</span>
            <span className="font-semibold">₹{totalExpected.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
