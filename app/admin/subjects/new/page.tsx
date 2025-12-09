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
  const [teacherId, setTeacherId] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Load classes + staff
  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, tRes] = await Promise.all([
          fetch("/api/classes"),
          fetch("/api/staff"),
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          code,
          classId,
          teacherId: teacherId || null,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Subject created");
      router.push("/admin/subjects");

    } catch (err: any) {
      toast.error(err.message || "Failed to create subject");
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
            
            {/* Subject Name */}
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Subject Code */}
            <div>
              <Label>Code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            {/* Class */}
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
                      <SelectItem value={c.id} key={c.id}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Teacher */}
            <div>
              <Label>Teacher (Optional)</Label>
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="">None</SelectItem>

                  {teachers.map((t) => (
                    <SelectItem value={t.id} key={t.id}>
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
                {submitting ? "Creating..." : "Create"}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
