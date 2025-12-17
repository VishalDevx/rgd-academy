"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TransactionType } from "@prisma/client";

type ExpenseForm = {
  title: string;
  description: string;
  amount: string;
  date: string;
  transaction: TransactionType;
};

export default function NewExpensePage() {
  const router = useRouter();

  const [form, setForm] = useState<ExpenseForm>({
    title: "",
    description: "",
    amount: "",
    date: "",
    transaction: TransactionType.DEBIT,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = <K extends keyof ExpenseForm>(
    key: K,
    value: ExpenseForm[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ---- basic client-side validation ----
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    const amount = Number(form.amount);
    if (!form.amount || Number.isNaN(amount) || amount <= 0) {
      setError("Amount must be a valid positive number");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      router.push("/admin/expenses");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create expense"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">New Expense</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={form.title}
            onChange={(e) => onChange("title", e.target.value)}
            required
          />
        </div>

        {/* Amount + Transaction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded border px-3 py-2"
              value={form.amount}
              onChange={(e) => onChange("amount", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Transaction Type
            </label>
            <select
              className="w-full rounded border px-3 py-2"
              value={form.transaction}
              onChange={(e) =>
                onChange("transaction", e.target.value as TransactionType)
              }
            >
              <option value={TransactionType.DEBIT}>Debit (Expense)</option>
              <option value={TransactionType.CREDIT}>Credit (Income)</option>
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            className="w-full rounded border px-3 py-2"
            value={form.date}
            onChange={(e) => onChange("date", e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description (optional)
          </label>
          <textarea
            rows={4}
            className="w-full rounded border px-3 py-2"
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded border px-4 py-2"
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className={`rounded px-4 py-2 text-white ${
              submitting
                ? "bg-blue-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {submitting ? "Creating..." : "Create Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}
