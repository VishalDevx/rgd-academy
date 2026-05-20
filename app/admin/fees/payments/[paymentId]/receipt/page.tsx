import { use } from "react"
import { FeeReceiptClient } from "@/app/components/FeeReceiptClient"

export default function ReceiptPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = use(params)
  return <FeeReceiptClient paymentId={paymentId} />
}
