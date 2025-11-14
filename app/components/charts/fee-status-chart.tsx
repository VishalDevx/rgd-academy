"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";

interface FeeStatusChartProps {
  paid: number;
  outstanding: number;
}

const COLORS = ["#4ade80", "#f87171"]; // green = paid, red = outstanding

export const FeeStatusChart: React.FC<FeeStatusChartProps> = ({ paid, outstanding }) => {
  const data = [
    { name: "Paid", value: paid },
    { name: "Outstanding", value: outstanding },
  ];

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Fee Status Overview</CardTitle>
        <CardDescription>Collected vs Outstanding fees.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-full">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              label={({ name, percent }) =>
                `${name}: ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>

        {/* Metrics below the chart */}
        <div className="mt-4 flex gap-6">
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-green-500">₹{paid.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">Paid</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-red-500">₹{outstanding.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">Outstanding</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
