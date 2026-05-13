"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

export default function EditResultPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [grade, setGrade] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/results/${id}`);
        const json = await res.json();
        const data = json.data || json;
        setMarks(String(data.marks || ""));
        setMaxMarks(String(data.maxMarks || ""));
        setGrade(data.grade || "");
        setRemarks(data.remarks || "");
      } catch {
        toast.error("Failed to load result");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/results/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marks: Number(marks),
          maxMarks: Number(maxMarks),
          grade: grade || null,
          remarks: remarks || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Result updated");
      router.push("/admin/results");
      router.refresh();
    } catch {
      toast.error("Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="max-w-lg mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Result</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Marks Obtained</Label>
              <Input type="number" value={marks} onChange={(e) => setMarks(e.target.value)} required />
            </div>
            <div>
              <Label>Max Marks</Label>
              <Input type="number" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} required />
            </div>
            <div>
              <Label>Grade (optional)</Label>
              <Input value={grade} onChange={(e) => setGrade(e.target.value)} />
            </div>
            <div>
              <Label>Remarks (optional)</Label>
              <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
