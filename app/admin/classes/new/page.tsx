"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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

const GRADES = [
  "NURSERY",
  "LKG",
  "UKG",
  "ONE",
  "TWO",
  "THREE",
  "FOUR",
  "FIVE",
  "SIX",
  "SEVEN",
  "EIGHT",
  "NINE",
  "TEN",
];

export default function NewClassPage() {
  const router = useRouter();

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  const [name, setName] = useState("");
  const [grade, setGrade] = useState("TEN");
  const [section, setSection] = useState("");
  const [classTeacherId, setClassTeacherId] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!classTeacherId) {
      setError("Please select a class teacher");
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
          classTeacherId,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      router.push("/admin/classes");
    } catch (err: unknown) {
        const message =
    err instanceof Error ? err.message : "Error saving class";

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
                    <div className="p-2 text-sm text-muted-foreground">
                      Loading…
                    </div>
                  ) : staff.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No staff found
                    </div>
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
