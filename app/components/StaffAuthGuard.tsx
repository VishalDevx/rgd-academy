"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function StaffAuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "STAFF") {
      router.replace("/login");
    }
  }, [session, status, router]);

  if (status === "loading") return <div>Loading...</div>;

  return <>{children}</>;
}
