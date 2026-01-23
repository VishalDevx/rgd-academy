"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Wallet, Receipt, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface FeePayment {
  id: string;
  amountPaid: string;
  remainAmount: string;
  status: "PENDING" | "PARTIAL" | "PAID";
  paymentDate: string | null;
  createdAt: string;
  feeStructure: {
    id: string;
    name: string | null;
    total: string;
    class: {
      name: string;
    };
  };
}

interface FeesData {
  feePayments: FeePayment[];
  feeStructures: Array<{
    id: string;
    name: string | null;
    total: string;
    class: { name: string };
    payments?: Array<{ amountPaid: string; status: "PENDING" | "PARTIAL" | "PAID" }>;
  }>;
  summary: {
    totalPaid: number;
    totalPending: number;
    paidCount: number;
    pendingCount: number;
    totalPayments: number;
  };
}

export default function StudentFeesPage() {
  const [data, setData] = useState<FeesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFees() {
      try {
        const res = await fetch("/api/student/fees");
        if (res.ok) {
          const feesData = await res.json();
          setData(feesData);
        }
      } catch (error) {
        console.error("Error fetching fees:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFees();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Failed to load fees data</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case "PARTIAL":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Partial
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fees Management</h1>
          <p className="text-gray-500 mt-1">View and manage your fee payments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Paid
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{data.summary.totalPaid.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.summary.paidCount} payment{data.summary.paidCount !== 1 ? "s" : ""} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Amount
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{data.summary.totalPending.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.summary.pendingCount} payment{data.summary.pendingCount !== 1 ? "s" : ""} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Payments
            </CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.totalPayments}
            </div>
            <p className="text-xs text-gray-500 mt-1">All fee records</p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Structures */}
      {data.feeStructures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Fee Structures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.feeStructures.map((structure) => {
                const payment = structure.payments?.[0];
                const totalAmount = Number(structure.total);
                const paidAmount = payment ? Number(payment.amountPaid) : 0;
                const remainingAmount = totalAmount - paidAmount;

                return (
                  <div
                    key={structure.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {structure.name || "Fee Structure"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {structure.class.name}
                        </p>
                        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Total Amount</p>
                            <p className="font-semibold text-gray-900">
                              ₹{totalAmount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Paid</p>
                            <p className="font-semibold text-green-600">
                              ₹{paidAmount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Remaining</p>
                            <p className="font-semibold text-red-600">
                              ₹{remainingAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {remainingAmount > 0 && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all"
                                style={{
                                  width: `${(paidAmount / totalAmount) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {Math.round((paidAmount / totalAmount) * 100)}% paid
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {payment ? (
                          getStatusBadge(payment.status)
                        ) : (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Not Paid
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.feePayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Fee Structure
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Amount Paid
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Remaining
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Payment Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.feePayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.feeStructure.name || "Fee Payment"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.feeStructure.class.name}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-green-600">
                          ₹{Number(payment.amountPaid).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-red-600">
                          ₹{Number(payment.remainAmount).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(payment.status)}</td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {payment.paymentDate
                          ? format(new Date(payment.paymentDate), "MMM dd, yyyy")
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No payment history found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
