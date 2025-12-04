"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";

interface ClassItem {
  id: string;
  name: string;
  grade: string;
}

// Define the expected API response
interface ClassesApiResponse {
  classes: ClassItem[];
}

interface FormState {
  name: string;
  email: string;
  adharNo: string;
  admissionNo: string;
  rollNumber: string;
  classId: string;
  dob: string;
  gender: string;
  address: string;
  caste: string;
  religion: string;
  occupation: string;
  fatherName: string;
  motherName: string;
  udiseCode: string;
  contactNo: string;
}

export default function NewStudentPage() {
  const router = useRouter();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    adharNo: "",
    admissionNo: "",
    rollNumber: "",
    classId: "",
    dob: "",
    gender: "",
    address: "",
    caste: "",
    religion: "",
    occupation: "",
    fatherName: "",
    motherName: "",
    udiseCode: "",
    contactNo: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/classes");
        if (!res.ok) throw new Error("Failed to fetch classes");

        const data: ClassesApiResponse = await res.json();
        setClasses(Array.isArray(data.classes) ? data.classes : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load classes");
      }
    };

    fetchClasses();
  }, []);

  const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (file) formData.append("file", file);

      const res = await fetch("/api/students", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create student");
      }

      router.push("/admin/students");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Add New Student</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Aadhar No</Label>
              <Input
                value={form.adharNo}
                onChange={(e) => onChange("adharNo", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Admission No</Label>
              <Input
                value={form.admissionNo}
                onChange={(e) => onChange("admissionNo", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Roll Number</Label>
              <Input
                value={form.rollNumber}
                onChange={(e) => onChange("rollNumber", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Father Name</Label>
              <Input
                value={form.fatherName}
                onChange={(e) => onChange("fatherName", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Mother Name</Label>
              <Input
                value={form.motherName}
                onChange={(e) => onChange("motherName", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>UDISE Code</Label>
              <Input
                value={form.udiseCode}
                onChange={(e) => onChange("udiseCode", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Religion</Label>
              <Input
                value={form.religion}
                onChange={(e) => onChange("religion", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Caste</Label>
              <Input
                value={form.caste}
                onChange={(e) => onChange("caste", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Contact No</Label>
              <Input
                value={form.contactNo}
                onChange={(e) => onChange("contactNo", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Occupation</Label>
              <Input
                value={form.occupation}
                onChange={(e) => onChange("occupation", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Class</Label>
              <Select
                value={form.classId}
                onValueChange={(v) => onChange("classId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.grade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>DOB</Label>
              <Input
                type="date"
                value={form.dob}
                onChange={(e) => onChange("dob", e.target.value)}
              />
            </div>

            <div>
              <Label>Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => onChange("gender", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Address</Label>
              <Textarea
                value={form.address}
                onChange={(e) => onChange("address", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Profile Image</Label>
            <div className="flex items-center gap-4 mt-2">
              {preview ? (
                <Image
                  src={preview}
                  alt="Preview"
                  width={80}
                  height={80}
                  className="rounded-full object-cover border"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border border-dashed flex items-center justify-center text-sm text-muted-foreground">
                  No Image
                </div>
              )}
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Student"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
