"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface AttendancePoint {
  date: string;
  percentage: number;
}

interface AttendanceTrendChartsProps {
  data: AttendancePoint[];
}

export default function AttendanceTrendCharts({ data }: AttendanceTrendChartsProps) {
  return (
    <div className="w-full">
      <h2 className="text-l font-semibold mb-4">Attendance Trend <br />
         <span className="text-sm font-light">Last 7 days Performance</span></h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
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
      </ResponsiveContainer>
    </div>
  );
}
