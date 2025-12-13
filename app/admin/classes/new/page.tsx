"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
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
  "NURSERY","LKG","UKG","ONE","TWO","THREE","FOUR","FIVE","SIX","SEVEN","EIGHT","NINE","TEN",
];

export default function NewClassPage() {
  const router = useRouter();

  const [staff, setStaff] = useState<Staff[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [name, setName] = useState("");
  const [grade, setGrade] = useState("TEN");
  const [section, setSection] = useState("");
  const [classTeacherId, setClassTeacherId] = useState("");
  const [academicSessionId, setAcademicSessionId] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load staff
  useEffect(() => {
    async function loadStaff() {
      try {
        const res = await fetch("/api/staff");
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          setStaff(json.data);
        } else {
          setStaff([]);
        }
      } catch (err) {
        console.error(err);
        setStaff([]);
      } finally {
        setLoadingStaff(false);
      }
    }

    loadStaff();
  }, []);

  // Load academic sessions
  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch("/api/academic-sessions");
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          setSessions(json.data);
          if (json.data.length > 0) setAcademicSessionId(json.data[0].id); // auto-select first session
        } else {
          setSessions([]);
        }
      } catch (err) {
        console.error(err);
        setSessions([]);
      } finally {
        setLoadingSessions(false);
      }
    }

    loadSessions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!classTeacherId) {
      setError("Please select a class teacher");
      setSubmitting(false);
      return;
    }

    if (!academicSessionId) {
      setError("Please select an academic session");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          grade,
          section,
          teacherId: classTeacherId,
          academicSessionId,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Class created successfully!");
      router.push("/admin/classes");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error saving class";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="max-w-lg mx-auto shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">New Class</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Grade */}
            <div>
              <Label>Grade</Label>
              <Select value={grade} onValueChange={(v) => setGrade(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section */}
            <div>
              <Label>Section</Label>
              <Input
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="A, B, ..."
              />
            </div>

            {/* Academic Session */}
            <div>
              <Label>Academic Session</Label>
              <Select
                value={academicSessionId}
                onValueChange={(v) => setAcademicSessionId(v)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {loadingSessions ? (
                    <div className="p-2 text-sm text-muted-foreground">Loading…</div>
                  ) : sessions.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No sessions found</div>
                  ) : (
                    sessions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Class Teacher */}
            <div>
              <Label>Class Teacher</Label>
              <Select
                value={classTeacherId}
                onValueChange={(v) => setClassTeacherId(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>

                <SelectContent>
                  {loadingStaff ? (
                    <div className="p-2 text-sm text-muted-foreground">Loading…</div>
                  ) : staff.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No staff found</div>
                  ) : (
                    staff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.user?.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
