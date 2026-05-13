"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/app/components/ui/select";
import { toast } from "sonner";

export default function EditHomeworkPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attachment, setAttachment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [hwRes, classesRes] = await Promise.all([
          fetch(`/api/homework/${id}`),
          fetch("/api/classes"),
        ]);
        const hwJson = await hwRes.json();
        const hw = hwJson.data || hwJson;
        const classesJson = await classesRes.json();

        setClassId(hw.classId || hw.class?.id || "");
        setSubjectId(hw.subjectId || hw.subject?.id || "");
        setTitle(hw.title || "");
        setDescription(hw.description || "");
        setDueDate(hw.dueDate ? hw.dueDate.split("T")[0] : "");
        setAttachment(hw.attachment || "");
        setClasses(classesJson?.data || []);

        // Load subjects
        const subRes = await fetch("/api/subjects");
        const subJson = await subRes.json();
        setSubjects(subJson?.data || []);
      } catch {
        toast.error("Failed to load homework");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !subjectId || !title || !dueDate) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/homework/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId, subjectId, title,
          description: description || undefined,
          dueDate,
          attachment: attachment || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Homework updated");
      router.push("/admin/homework");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="p-6">
      <Card className="max-w-lg mx-auto shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Edit Homework</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Class</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId} disabled={!classId}>
                <SelectTrigger><SelectValue placeholder={classId ? "Select subject" : "Select class first"} /></SelectTrigger>
                <SelectContent>
                  {subjects.filter((s) => !classId || s.id === subjectId || !subjectId).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
            <div>
              <Label>Attachment URL (optional)</Label>
              <Input value={attachment} onChange={(e) => setAttachment(e.target.value)} placeholder="https://..." />
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Updating..." : "Update"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
