"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { toast } from "sonner";

type Staff = { id: string; user: { name: string } };
type AcademicSession = { id: string; name: string };

const GRADES = [
  "NURSERY","LKG","UKG","ONE","TWO","THREE","FOUR",
  "FIVE","SIX","SEVEN","EIGHT","NINE","TEN",
];

export default function EditClassPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);

  const [name, setName] = useState("");
  const [grade, setGrade] = useState("TEN");
  const [section, setSection] = useState("");
  const [classTeacherId, setClassTeacherId] = useState("");
  const [academicSessionId, setAcademicSessionId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [classRes, staffRes, sessRes] = await Promise.all([
          fetch(`/api/classes/${id}`),
          fetch("/api/staff"),
          fetch("/api/academic-sessions"),
        ]);
        const cls = await classRes.json();
        const staffJson = await staffRes.json();
        const sessJson = await sessRes.json();

        const c = cls.data || cls;
        setName(c.name || "");
        setGrade(c.grade || "TEN");
        setSection(c.section || "");
        setClassTeacherId(c.teacherId || "");
        setAcademicSessionId(c.academicSessionId || "");
        setStaff(staffJson.data || []);
        setSessions(sessJson.data || []);
      } catch {
        toast.error("Failed to load class");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          grade,
          section,
          teacherId: classTeacherId || null,
          academicSessionId,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Class updated");
      router.push("/admin/classes");
      router.refresh();
    } catch {
      toast.error("Failed to update class");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="max-w-lg mx-auto">
        <CardHeader><CardTitle>Edit Class</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Grade</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger />
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Section</Label>
              <Input value={section} onChange={(e) => setSection(e.target.value)} />
            </div>
            <div>
              <Label>Academic Session</Label>
              <Select value={academicSessionId} onValueChange={setAcademicSessionId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Class Teacher</Label>
              <Select value={classTeacherId} onValueChange={setClassTeacherId}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
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
