"use client";

import React from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";

interface FeeStatusChartProps {
  paid: number;
  partial: number;
  outstanding: number;
}

// Paid = green, Partial = yellow, Outstanding = red
const COLORS = ["#4ade80", "#facc15", "#f87171"];

export const FeeStatusChart: React.FC<FeeStatusChartProps> = ({
  paid,
  partial,
  outstanding,
}) => {
  const data = [
    { name: "Paid", value: paid },
    { name: "Partial", value: partial },
    { name: "Outstanding", value: outstanding },
  ];

  return (
    <Card className="w-full h-full">
      <CardContent className="flex flex-col items-center justify-center p-4 h-full">
        
        {/* Chart Container */}
        <div className="w-full" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>

              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Metrics */}
        <div className="mt-4 flex gap-8">

          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-green-500">
              ₹{paid.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">Paid</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-yellow-500">
              ₹{partial.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">Partial</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-red-500">
              ₹{outstanding.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">Outstanding</span>
          </div>

        </div>

      </CardContent>
    </Card>
  );
};
