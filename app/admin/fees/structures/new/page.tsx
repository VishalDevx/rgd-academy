"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { toast } from "sonner";

interface FeeStructureForm {
  classId: string;
  name: string;
  tuitionFee: string;
  examFee: string;
  transportFee: string;
  miscFee: string;
}

interface ClassType {
  id: string;
  name: string;
}

export default function NewFeeStructurePage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [form, setForm] = useState<FeeStructureForm>({
    classId: "",
    name: "",
    tuitionFee: "",
    examFee: "",
    transportFee: "",
    miscFee: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

useEffect(() => {
  fetch("/api/classes")
    .then((res) => res.json())
    .then((response) => {
      if (!response.success || !Array.isArray(response.data)) {
        throw new Error("Invalid data format");
      }
      setClasses(response.data); // <-- extract the array
    })
    .catch(() => toast.error("Failed to load classes"));
}, []);

  const onChange = (key: keyof FeeStructureForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/fees/structures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Fee structure created successfully!");
      router.push("/admin/fees");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message :"Error in the fee saving";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>New Fee Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Class Select */}
              <div>
                <Label htmlFor="classId">Class</Label>
                <Select
                  value={form.classId}
                  onValueChange={(val) => onChange("classId", val)}
                  required
                >
                  <SelectTrigger id="classId">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  placeholder="Structure name (optional)"
                  onChange={(e) => onChange("name", e.target.value)}
                />
              </div>

              {/* Tuition Fee */}
              <div>
                <Label htmlFor="tuitionFee">Tuition Fee</Label>
                <Input
                  id="tuitionFee"
                  type="number"
                  value={form.tuitionFee}
                  onChange={(e) => onChange("tuitionFee", e.target.value)}
                  required
                />
              </div>

              {/* Exam Fee */}
              <div>
                <Label htmlFor="examFee">Exam Fee</Label>
                <Input
                  id="examFee"
                  type="number"
                  value={form.examFee}
                  onChange={(e) => onChange("examFee", e.target.value)}
                />
              </div>

              {/* Transport Fee */}
              <div>
                <Label htmlFor="transportFee">Transport Fee</Label>
                <Input
                  id="transportFee"
                  type="number"
                  value={form.transportFee}
                  onChange={(e) => onChange("transportFee", e.target.value)}
                />
              </div>

              {/* Misc Fee */}
              <div>
                <Label htmlFor="miscFee">Miscellaneous Fee</Label>
                <Input
                  id="miscFee"
                  type="number"
                  value={form.miscFee}
                  onChange={(e) => onChange("miscFee", e.target.value)}
                />
              </div>
            </div>

            {/* Error message */}
            {error && <p className="text-sm text-destructive">{error}</p>}

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
              >
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
