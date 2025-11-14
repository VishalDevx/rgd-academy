"use client";
import React from "react";

interface Payment {
  id: string;
  amountPaid: number;
  createdAt: Date;
}

interface PaymentsTrendChartProps {
  payments: Payment[];
}
export const PaymentsTrendChart: React.FC<PaymentsTrendChartProps> = ({ payments }) => {
  return (
    <div className="w-full h-64 overflow-auto border rounded-md p-2">
      <h3 className="font-bold mb-2">Last {payments.length} payments</h3>
      <ul>
        {payments.map((p) => (
          <li key={p.id}>
            ₹{p.amountPaid.toLocaleString()} — {new Date(p.createdAt).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};
