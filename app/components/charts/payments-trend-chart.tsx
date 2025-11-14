"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";

interface Payment {
  id: string;
  amountPaid: number;
  createdAt: Date;
  status: "PAID" | "PENDING" | "PARTIAL";
  studentName?: string;
}

interface PaymentsTrendChartProps {
  payments: Payment[];
}

export const PaymentsTrendChart: React.FC<PaymentsTrendChartProps> = ({ payments }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Last 5 Payments</CardTitle>
        <CardDescription>Most recent fee payments.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.studentName ?? "Unknown"}</TableCell>
                <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">₹{p.amountPaid.toLocaleString()}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={p.status === "PAID" ? "secondary" : "destructive"}>
                    {p.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
