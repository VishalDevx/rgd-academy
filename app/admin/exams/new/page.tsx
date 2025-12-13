"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { toast } from "sonner";
import { ExamCategory } from "@prisma/client";

interface ClassType {
  id: string;
  name: string;
}

interface ExamForm {
  name: string;
  classId: string;
  startDate: string;
  endDate: string;
  category: ExamCategory;
}

export default function NewExamPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [form, setForm] = useState<ExamForm>({
    name: "",
    classId: "",
    startDate: "",
    endDate: "",
    category: "UNIT_TEST",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/classes");
        if (!res.ok) throw new Error("Failed to fetch classes");

        const data: ClassType[] = (await res.json())?.data ?? [];
        setClasses(data);

        if (data.length > 0 && !form.classId) {
          setForm((prev) => ({ ...prev, classId: data[0].id }));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load classes");
      }
    };

    fetchClasses();
  }, []);

  const onChange = (key: keyof ExamForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Exam created successfully!");
      router.push("/admin/exams");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error saving exam";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>New Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Exam Name */}
              <div>
                <Label htmlFor="name">Exam Name</Label>
                <Input
                  id="name"
                  placeholder="Enter exam name"
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  required
                />
              </div>

              {/* Class Select */}
              <div>
                <Label htmlFor="classId">Class</Label>
                <Select
                  value={form.classId || undefined}
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

              {/* Start Date */}
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => onChange("startDate", e.target.value)}
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => onChange("endDate", e.target.value)}
                  required
                />
              </div>

              {/* Category Select */}
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(val) => onChange("category", val)}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ExamCategory).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Exam"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
