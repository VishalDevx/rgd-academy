"use client";

import { useState, FormEvent } from "react";
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

type StudentFormProps = {
  student: any; // existing student data
  onSubmit?: () => void;
};

export default function EditStudentForm({ student, onSubmit }: StudentFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: student.user.name,
    email: student.user.email,
    adharNo: student.user.adharNo,
    admissionNo: student.admissionNo,
    rollNumber: student.rollNumber,
    classId: student.classId,
    dob: student.dob ? new Date(student.dob).toISOString().substring(0, 10) : "",
    gender: student.gender || "MALE",
    address: student.address || "",

    fatherName: student.fatherName || "",
    motherName: student.motherName || "",
    occupation: student.occupation || "",
    religion: student.religion || "",
    caste: student.caste || "",
    udiseCode: student.udiseCode || "",
    contactNo: student.contactNo || "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value as string);
      });
      if (file) data.append("file", file);

      const res = await fetch(`/api/students/${student.id}`, {
        method: "PUT",
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update student");

      onSubmit?.();
      router.push("/admin/students");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Edit Student</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-600">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={e => handleChange("name", e.target.value)} required />
            </div>

            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={e => handleChange("email", e.target.value)} required />
            </div>

            <div>
              <Label>Aadhar No</Label>
              <Input value={formData.adharNo} onChange={e => handleChange("adharNo", e.target.value)} required />
            </div>

            <div>
              <Label>Admission No</Label>
              <Input value={formData.admissionNo} onChange={e => handleChange("admissionNo", e.target.value)} required />
            </div>

            <div>
              <Label>Roll Number</Label>
              <Input value={formData.rollNumber} onChange={e => handleChange("rollNumber", e.target.value)} required />
            </div>

            <div>
              <Label>Class ID</Label>
              <Input value={formData.classId} onChange={e => handleChange("classId", e.target.value)} />
            </div>

            <div>
              <Label>DOB</Label>
              <Input type="date" value={formData.dob} onChange={e => handleChange("dob", e.target.value)} />
            </div>

            <div>
              <Label>Gender</Label>
              <Select value={formData.gender} onValueChange={v => handleChange("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Address</Label>
              <Textarea value={formData.address} onChange={e => handleChange("address", e.target.value)} />
            </div>

            <div>
              <Label>Father Name</Label>
              <Input value={formData.fatherName} onChange={e => handleChange("fatherName", e.target.value)} />
            </div>

            <div>
              <Label>Mother Name</Label>
              <Input value={formData.motherName} onChange={e => handleChange("motherName", e.target.value)} />
            </div>

            <div>
              <Label>Occupation</Label>
              <Input value={formData.occupation} onChange={e => handleChange("occupation", e.target.value)} />
            </div>

            <div>
              <Label>Religion</Label>
              <Input value={formData.religion} onChange={e => handleChange("religion", e.target.value)} />
            </div>

            <div>
              <Label>Caste</Label>
              <Input value={formData.caste} onChange={e => handleChange("caste", e.target.value)} />
            </div>

            <div>
              <Label>UDISE Code</Label>
              <Input value={formData.udiseCode} onChange={e => handleChange("udiseCode", e.target.value)} />
            </div>

            <div>
              <Label>Contact No</Label>
              <Input value={formData.contactNo} onChange={e => handleChange("contactNo", e.target.value)} />
            </div>

            <div className="md:col-span-2">
              <Label>Profile Image</Label>
              <Input type="file" onChange={handleFileChange} />
            </div>

          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Student"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
