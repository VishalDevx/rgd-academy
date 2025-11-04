'use client'

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleBeforeUnload = () => {
      navigator.sendBeacon("/api/auth/signout");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
