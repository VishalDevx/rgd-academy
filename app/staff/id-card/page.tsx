"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/app/components/ui/card";
import { Loader2, CreditCard } from "lucide-react";
import { IDCardClient } from "@/app/components/IDCardClient";
import { useSession } from "next-auth/react";

export default function StaffIDCardPage() {
  const { data: session } = useSession();
  const [staffId, setStaffId] = useState<string | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/staff/profile`)
      .then((res) => res.json())
      .then((json) => {
        if (json.staff?.id) {
          setStaffId(json.staff.id);
        }
      })
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    if (!staffId) return;
    fetch(`/api/id-cards?staffId=${staffId}`)
      .then((res) => res.json())
      .then((json) => {
        const cards = json.data ?? [];
        if (cards.length > 0) {
          setCardId(cards[0].id);
        }
      })
      .catch(() => toast.error("Failed to load ID card"))
      .finally(() => setLoading(false));
  }, [staffId]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!cardId) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">
            My ID Card
          </h1>
          <p className="text-sm text-muted-foreground">View your ID card</p>
        </div>
        <Card className="flex flex-col items-center justify-center py-16 text-gray-500">
          <CreditCard className="h-16 w-16 mb-4 text-gray-300" />
          <p>No ID card issued yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Contact the school administration
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">
          My ID Card
        </h1>
        <p className="text-sm text-muted-foreground">View your ID card</p>
      </div>
      <IDCardClient cardId={cardId} />
    </div>
  );
}
