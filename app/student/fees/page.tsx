"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Wallet, Receipt, AlertCircle, CheckCircle2, Clock, Loader2, CreditCard } from "lucide-react";
import Link from "next/link";
import Pagination from "@/app/components/Pagination";
import { toast } from "sonner";
import { loadRazorpayScript } from "@/app/lib/razorpay";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

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
    monthlyFee: string | null;
    totalMonths: number;
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
  const [page, setPage] = useState(1);
  const [onlineEnabled, setOnlineEnabled] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [feesRes, configRes] = await Promise.all([
          fetch("/api/student/fees"),
          fetch("/api/fees/payment-config"),
        ]);
        if (feesRes.ok) {
          setData(await feesRes.json());
        }
        if (configRes.ok) {
          const cfg = await configRes.json();
          setOnlineEnabled(cfg.enabled);
        }
      } catch (error) {
        console.error("Error fetching fees:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const handlePayOnline = useCallback(async (feePaymentId: string) => {
    setPayingId(feePaymentId);
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        toast.error("Failed to load payment gateway. Please try again.")
        setPayingId(null)
        return
      }

      const orderRes = await fetch("/api/fees/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feePaymentId }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "KakshaOne",
        description: "Fee Payment",
        order_id: orderData.order_id,
        handler: async function (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) {
          const verifyRes = await fetch("/api/fees/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              feePaymentId,
            }),
          })
          const verifyData = await verifyRes.json()
          if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed")
          toast.success("Payment successful!")
          const feesRes = await fetch("/api/student/fees")
          if (feesRes.ok) setData(await feesRes.json())
        },
        modal: {
          ondismiss: function () {
            setPayingId(null)
          },
        },
        theme: { color: "#6366f1" },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed")
    } finally {
      setPayingId(null)
    }
  }, [])

  const feePayments = data?.feePayments ?? [];
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(feePayments.length / PAGE_SIZE);
  const paginatedPayments = feePayments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        <Link
          href="/student/fees/slip"
          className="inline-flex items-center px-4 py-2 rounded-md bg-black text-white text-sm font-semibold hover:bg-gray-800 transition"
        >
          <Receipt className="h-4 w-4 mr-2" />
          Download Fee Statement
        </Link>
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
                const monthlyFee = structure.monthlyFee ? Number(structure.monthlyFee) : 0;
                const totalMonths = structure.totalMonths || 12;

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
                        {monthlyFee > 0 && (
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            ₹{monthlyFee}/month × {totalMonths} months
                          </p>
                        )}
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayments.map((payment) => {
                    const canPay = onlineEnabled && (payment.status === "PENDING" || payment.status === "PARTIAL") && Number(payment.remainAmount) > 0;
                    return (
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
                        <td className="py-4 px-4">
                          {canPay && (
                            <Button
                              size="sm"
                              onClick={() => handlePayOnline(payment.id)}
                              disabled={payingId === payment.id}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {payingId === payment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Pay Online"
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No payment history found</p>
            </div>
          )}
          {paginatedPayments.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={feePayments.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
