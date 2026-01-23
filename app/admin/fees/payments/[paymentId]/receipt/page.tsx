"use client";

import { useParams } from "next/navigation";
import { FeeReceiptClient } from "@/app/components/FeeReceiptClient";

export default function PaymentReceiptPage() {
  const params = useParams<{ paymentId: string }>();
  const paymentId = params?.paymentId ?? "";

  return <FeeReceiptClient paymentId={paymentId} />;
}

