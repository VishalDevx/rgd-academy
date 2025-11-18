"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";

interface ClassItem {
  id: string;
  name: string;
  grade: string;
}

export default function NewStudentPage() {
  const router = useRouter();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [form, setForm] = useState({
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

  // Fetch classes
  useEffect(() => {
    fetch("/api/classes")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch classes");
        setClasses(await res.json());
      })
      .catch(console.error);
  }, []);

  const onChange = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (file) formData.append("file", file);

      const res = await fetch("/api/students", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      router.push("/admin/students");
    } catch (err: any) {
      setError(err.message || "Failed to create student");
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

            {/* Name */}
            <div>
              <Label>Full Name</Label>
              <Input
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                required
              />
            </div>

            {/* Aadhar */}
            <div>
              <Label>Aadhar No</Label>
              <Input
                value={form.adharNo}
                onChange={(e) => onChange("adharNo", e.target.value)}
                required
              />
            </div>

            {/* Admission */}
            <div>
              <Label>Admission No</Label>
              <Input
                value={form.admissionNo}
                onChange={(e) => onChange("admissionNo", e.target.value)}
                required
              />
            </div>

            {/* Roll */}
            <div>
              <Label>Roll Number</Label>
              <Input
                value={form.rollNumber}
                onChange={(e) => onChange("rollNumber", e.target.value)}
                required
              />
            </div>

            {/* Father */}
            <div>
              <Label>Father Name</Label>
              <Input
                value={form.fatherName}
                onChange={(e) => onChange("fatherName", e.target.value)}
                required
              />
            </div>

            {/* Mother */}
            <div>
              <Label>Mother Name</Label>
              <Input
                value={form.motherName}
                onChange={(e) => onChange("motherName", e.target.value)}
                required
              />
            </div>

            {/* Udise */}
            <div>
              <Label>UDISE Code</Label>
              <Input
                value={form.udiseCode}
                onChange={(e) => onChange("udiseCode", e.target.value)}
                required
              />
            </div>
            {/* Religion */}
         <div>
              <Label>Religion</Label>
              <Input
                value={form.religion}
                onChange={(e) => onChange("religion", e.target.value)}
                required
              />
            </div>
            {/* caste */}
            <div>
              <Label>Caste</Label>
              <Input
                value={form.caste}
                onChange={(e) => onChange("caste", e.target.value)}
                required
              />
            </div>
            {/* Contact */}
            <div>
              <Label>Contact No</Label>
              <Input
                value={form.contactNo}
                onChange={(e) => onChange("contactNo", e.target.value)}
                required
              />
            </div>

            {/* Occupation */}
            <div>
              <Label>Occupation</Label>
              <Input
                value={form.occupation}
                onChange={(e) => onChange("occupation", e.target.value)}
                required
              />
            </div>

            {/* Class */}
            <div>
              <Label>Class</Label>
              <Select
                onValueChange={(v) => onChange("classId", v)}
                value={form.classId}
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

            {/* DOB */}
            <div>
              <Label>DOB</Label>
              <Input
                type="date"
                value={form.dob}
                onChange={(e) => onChange("dob", e.target.value)}
              />
            </div>

            {/* Gender */}
            <div>
              <Label>Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => onChange("gender", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <Label>Address</Label>
              <Textarea
                value={form.address}
                onChange={(e) => onChange("address", e.target.value)}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label>Profile Image</Label>
            <div className="flex items-center gap-4 mt-2">
              {preview ? (
                <img
                  src={preview}
                  className="w-20 h-20 rounded-full object-cover border"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border border-dashed flex items-center justify-center text-sm text-muted-foreground">
                  No Image
                </div>
              )}

              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {/* Buttons */}
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
