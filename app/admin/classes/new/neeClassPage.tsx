"use client";

import { useRouter } from "next/navigation";
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

type Staff = {
  id: string;
  user: { name: string };
};

type AcademicSession = {
  id: string;
  name: string;
};

const GRADES = [
  "NURSERY","LKG","UKG","ONE","TWO","THREE","FOUR",
  "FIVE","SIX","SEVEN","EIGHT","NINE","TEN",
];

export default function NewClassClient() {
  const router = useRouter();

  const [staff, setStaff] = useState<Staff[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [name, setName] = useState("");
  const [grade, setGrade] = useState("TEN");
  const [section, setSection] = useState("");
  const [classTeacherId, setClassTeacherId] = useState<string>();
  const [academicSessionId, setAcademicSessionId] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/staff");
        const json = await res.json();
        if (json.success) setStaff(json.data);
      } catch {
        toast.error("Failed to load staff");
      } finally {
        setLoadingStaff(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/academic-sessions");
        const json = await res.json();
        setSessions(json.data);
      } catch {
        toast.error("Failed to load sessions");
      } finally {
        setLoadingSessions(false);
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!classTeacherId || !academicSessionId) {
      toast.error("Missing required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, grade, section, teacherId: classTeacherId, academicSessionId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Class created");
      router.push("/admin/classes");
    } catch {
      toast.error("Failed to create class");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <Card className="max-w-lg mx-auto">
        <CardHeader><CardTitle>New Class</CardTitle></CardHeader>
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
                <SelectTrigger>
                  <SelectValue placeholder={loadingSessions ? "Loading..." : "Select"} />
                </SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue placeholder={loadingStaff ? "Loading..." : "Select"} />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
