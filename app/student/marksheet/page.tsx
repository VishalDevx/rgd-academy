"use client";

import { useEffect, useState } from "react";
import MarksheetClient from "@/app/components/MarksheetClient";

type StudentProfileResponse = { student: { id: string } };

export default function StudentMarksheetPage() {
  const [studentId, setStudentId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/student/profile")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Failed");
        return res.json();
      })
      .then((payload: StudentProfileResponse) => {
        const id = payload?.student?.id;
        if (!id) throw new Error("Student not found");
        setStudentId(String(id));
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12 text-center text-gray-500">Loading…</div>;
  if (error) return <div className="py-12 text-center text-red-600">{error}</div>;
  if (!studentId) return null;

  return <MarksheetClient studentId={studentId} />;
}

