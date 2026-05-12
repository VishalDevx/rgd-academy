"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface PDFDownloadButtonProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function PDFDownloadButton({
  onClick,
  loading = false,
  label = "Download PDF",
  variant = "default",
  size = "sm",
  className,
}: PDFDownloadButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {size !== "icon" && <span className="ml-2">{loading ? "Generating..." : label}</span>}
    </Button>
  );
}
