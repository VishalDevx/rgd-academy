"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
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

type ClassType = {
  id: string;
  name: string;
};

type Staff = {
  id: string;
  user: { name: string };
};

export default function NewSubjectPage() {
  const router = useRouter();

  const [classes, setClasses] = useState<ClassType[]>([]);
  const [teachers, setTeachers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [classId, setClassId] = useState("");
  const [teacherId, setTeacherId] = useState("none");

  const [submitting, setSubmitting] = useState(false);

  // Load classes + teachers
  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, tRes] = await Promise.all([
          fetch("/api/classes", { credentials: "include" }),
          fetch("/api/staff", { credentials: "include" }),
        ]);

        const cJson = await cRes.json();
        const tJson = await tRes.json();

        setClasses(cJson?.data || []);
        setTeachers(tJson?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        credentials: "include", // IMPORTANT
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          code,
          classId:classId === "none" ? null:classId,
          teacherId: teacherId === "none" ? null : teacherId,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Subject created");
      router.push("/admin/subjects");
    } catch (error: any) {
      toast.error(error.message || "Failed to create subject");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="max-w-lg mx-auto shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">New Subject</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Class</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>

                <SelectContent>
                  {loading ? (
                    <div className="p-2 text-sm text-muted-foreground">Loading…</div>
                  ) : (
                    classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Teacher (optional)</Label>
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="none">None</SelectItem>

                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>

              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
