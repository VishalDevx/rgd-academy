"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Checkbox } from "@/app/components/ui/checkbox";

// ---------------------------------------------
// TYPES (STOP USING unknown[] OR any)
// ---------------------------------------------
type ClassItem = {
  id: string;
  name: string;
  grade: string;
  section: string | null;
};

type StaffForm = {
  name: string;
  email: string;
  adharNo: string;
  designation: string;
  salary: string;
  classIds: string[];
};

export default function NewStaffPage() {
  const router = useRouter();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [form, setForm] = useState<StaffForm>({
    name: "",
    email: "",
    adharNo: "",
    designation: "",
    salary: "",
    classIds: [],
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onChange = <K extends keyof StaffForm>(key: K, value: StaffForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  // ---------------------------------------------
  // Fetch classes
  // ---------------------------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/classes");
        const json = await res.json();

        if (Array.isArray(json.data)) {
          setClasses(json.data as ClassItem[]);
        } else {
          setClasses([]);
        }
      } catch (err) {
        console.error("Failed loading classes:", err);
      } finally {
        setLoadingClasses(false);
      }
    };

    load();
  }, []);

  // ---------------------------------------------
  // Submit Staff
  // ---------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed creating staff");
      }

      router.push("/admin/staff");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error occurred";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-2xl shadow-md border border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">New Staff</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* FORM SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Aadhar No</Label>
                <Input
                  value={form.adharNo}
                  onChange={(e) => onChange("adharNo", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label>Designation</Label>
                <Input
                  value={form.designation}
                  onChange={(e) => onChange("designation", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Salary</Label>
                <Input
                  value={form.salary}
                  onChange={(e) => onChange("salary", e.target.value)}
                />
              </div>
            </div>

            {/* CLASS ASSIGNMENT */}
            <div>
              <Label>Assign Classes</Label>

              {loadingClasses ? (
                <p className="text-sm text-muted-foreground">Loading classes…</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {classes.map((cls) => (
                    <label
                      key={cls.id}
                      className="flex items-center space-x-2 border p-2 rounded"
                    >
                      <Checkbox
                        checked={form.classIds.includes(cls.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onChange("classIds", [...form.classIds, cls.id]);
                          } else {
                            onChange(
                              "classIds",
                              form.classIds.filter((x) => x !== cls.id)
                            );
                          }
                        }}
                      />
                      <span>
                        {cls.name} ({cls.grade} - {cls.section ?? "-"})
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* BUTTONS */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => router.back()}>
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
