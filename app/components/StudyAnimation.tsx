"use client";

import { motion } from "framer-motion";

export function StudyAnimation() {
  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      {/* Desk */}
      <motion.div
        className="absolute bottom-0 w-64 h-3 bg-blue-300 rounded-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      />

      {/* Student head */}
      <motion.div
        className="absolute bottom-24 w-14 h-14 bg-blue-500 rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />

      {/* Body */}
      <motion.div
        className="absolute bottom-10 w-20 h-20 bg-blue-400 rounded-t-2xl"
        initial={{ scaleY: 0.9 }}
        animate={{ scaleY: [0.9, 1, 0.9] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />

      {/* Book */}
      <motion.div
        className="absolute bottom-10 w-28 h-2 bg-white border border-blue-400 rounded-sm shadow-md"
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />

      {/* Floating idea lightbulb */}
      <motion.div
        className="absolute top-10 w-10 h-10 bg-yellow-300 rounded-full shadow-lg"
        animate={{ y: [0, -8, 0], opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
      />
    </div>
  );
}
