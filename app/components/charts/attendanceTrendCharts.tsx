// app/components/charts/AttendanceTrendCharts.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Brush,
} from "recharts";

interface AttendancePoint {
  date: string;        // e.g., "Nov-03"
  percentage: number;  // 0–100
}

interface AttendanceTrendChartsProps {
  data: AttendancePoint[];
}

export default function AttendanceTrendCharts({ data }: AttendanceTrendChartsProps) {
  return (
    <div className="shadow-sm border bg-white p-4 rounded-xl " style={{ width: "100%", maxWidth: 800 }}>
      <h2 className="text-l font-semibold mb-4">Attendance Trend <br />
         <span className="text-sm font-light">Last 7 days Perfomances</span></h2>

      <LineChart
        width={800}
        height={300}
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
        <Tooltip formatter={(value) => `${value}%`} />
        <Line
          type="monotone"
          dataKey="percentage"
          stroke="#0070f3"
          strokeWidth={2}
          dot={false}
        />
        
      </LineChart>
    </div>
  );
}
