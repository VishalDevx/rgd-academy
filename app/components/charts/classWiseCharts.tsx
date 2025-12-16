"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface Props {
  data: {
    name: string;
    studentCount: number;
  }[];
}

export default function ClassWiseCharts({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No class-wise data available
      </p>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 10, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* Primary: Student Count */}
          <Bar
            dataKey="studentCount"
            name="Students"
            barSize={30}
            fill="#2563eb" // blue-600
            radius={[6, 6, 0, 0]}
          />

          {/* Optional trend line (same data, visual emphasis) */}
          <Line
            type="monotone"
            dataKey="studentCount"
            stroke="#f97316" // orange-500
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
