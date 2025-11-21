"use client";

import { useRouter } from "next/navigation";
import { JSX, useEffect, useState } from "react";
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

type SchoolClass = {
  id: string;
  name: string;
  grade: string;
  section?: string | null;
};

type FormState = {
  name: string;
  email: string;
  adharNo: string;
  designation: string;
  salary: string; // keep as string for controlled input
  classId: string; // single class assignment
};

export default function NewStaffPage(): JSX.Element {
  const router = useRouter();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState<boolean>(true);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    adharNo: "",
    designation: "",
    salary: "",
    classId: "",
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // typed setter
  const onChange = (k: keyof FormState, v: string): void => {
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  // load classes for the dropdown
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await fetch("/api/classes");
        if (!res.ok) throw new Error(`Failed to load classes: ${res.status}`);
        const json = await res.json();
        const data: SchoolClass[] = Array.isArray(json?.data) ? json.data : [];
        if (mounted) setClasses(data);
      } catch (err: unknown) {
        // log but don't prevent the form
        // eslint-disable-next-line no-console
        console.error("Failed to fetch classes:", err);
      } finally {
        if (mounted) setLoadingClasses(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const validate = (values: FormState): string | null => {
    if (!values.name.trim()) return "Name is required";
    if (!values.email.trim()) return "Email is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) return "Invalid email";
    if (!values.designation.trim()) return "Designation is required";
    if (values.salary && isNaN(Number(values.salary))) return "Salary must be a number";
    // If you require a class assignment make it mandatory:
    // if (!values.classId) return "Please assign a class";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        adharNo: form.adharNo.trim() || undefined,
        designation: form.designation.trim(),
        salary: form.salary ? Number(form.salary) : undefined,
        classId: form.classId || undefined,
      } as Record<string, unknown>;

      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || `Server returned ${res.status}`);
      }

      // success — navigate back to staff list
      router.push("/admin/staff");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-2xl shadow-md border border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">New Staff</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Create new staff">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="adharNo">Aadhar No</Label>
                <Input
                  id="adharNo"
                  value={form.adharNo}
                  onChange={(e) => onChange("adharNo", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={form.designation}
                  onChange={(e) => onChange("designation", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  value={form.salary}
                  onChange={(e) => onChange("salary", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="class">Assign Class (Class Teacher)</Label>
              {loadingClasses ? (
                <p className="text-sm text-muted-foreground">Loading classes…</p>
              ) : (
                <select
                  id="class"
                  className="border rounded p-2 w-full"
                  value={form.classId}
                  onChange={(e) => onChange("classId", e.target.value)}
                >
                  <option value="">-- No class (optional) --</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.grade}{cls.section ? ` - ${cls.section}` : ""})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
