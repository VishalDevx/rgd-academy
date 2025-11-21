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

export default function NewStaffPage() {
  const router = useRouter();

  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    adharNo: "",
    designation: "",
    salary: "",
    classIds: [] as string[],
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onChange = (k: keyof typeof form, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  // -------------------------
  // Fetch classes for dropdown
  // -------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/classes");
        const data = await res.json();
        setClasses(data.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingClasses(false);
      }
    };
    load();
  }, []);

  // -------------------------
  // Submit
  // -------------------------
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

      if (!res.ok) throw new Error(await res.text());
      router.push("/admin/staff");
    } catch (err: any) {
      setError(err.message ?? "Failed");
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
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* FORM FIELDS */}
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
                        {cls.name} ({cls.grade} - {cls.section})
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
