"use client";

import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  type?: "card" | "table" | "list"; // shape of skeleton
  count?: number; // number of items
}

export function LoadingSkeleton({ type = "card", count = 3 }: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  const skeletonClasses = {
    card: "h-32 w-full rounded-2xl bg-gray-200 dark:bg-gray-700 relative overflow-hidden",
    table: "h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700 relative overflow-hidden",
    list: "h-6 w-full rounded-md bg-gray-200 dark:bg-gray-700 relative overflow-hidden",
  };

  return (
    <div className={`space-y-4`}>
      {items.map((_, idx) => (
        <motion.div
          key={idx}
          className={skeletonClasses[type]}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]"></div>
        </motion.div>
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-[shimmer_1.5s_infinite] {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
