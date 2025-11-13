"use client";

import { useState } from "react";

export default function StudentPasswordManager() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    if (!newPassword) return setMessage("Enter a password first");
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/students/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Passwords updated for ${data.updatedCount} students`);
      } else {
        setMessage(`❌ Error: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      setMessage(`❌ Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6 max-w-md">
      <h2 className="text-lg font-semibold mb-4">Reset All Student Passwords</h2>
      <input
        type="text"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Enter new password"
        className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      <button
        onClick={handleReset}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Updating..." : "Reset Passwords"}
      </button>
      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
