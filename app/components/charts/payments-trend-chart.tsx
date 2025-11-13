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
    <div className="w-full h-64 flex items-center justify-center border rounded-md">
      {/* Replace with actual chart library */}
      <p>Last {payments.length} payments</p>
    </div>
  );
};
