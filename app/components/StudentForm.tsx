"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  SelectValue
} from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/app/components/ui/form";


// ------------------------------
// ZOD SCHEMA
// ------------------------------
const StudentEditSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  adharNo: z.string().min(6),
  admissionNo: z.string(),
  rollNumber: z.string(),
  classId: z.string(),
  dob: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  address: z.string().optional(),

  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  occupation: z.string().optional(),
  religion: z.string().optional(),
  caste: z.string().optional(),
  udiseCode: z.string().optional(),
  contactNo: z.string().optional(),
});

export type StudentEditValues = z.infer<typeof StudentEditSchema>;


// ------------------------------
// PROPS
// ------------------------------
interface EditStudentFormProps {
  student: {
    id: string;
    classId: string;
    admissionNo: string;
    rollNumber: string;
    dob: string | null;
    gender: "MALE" | "FEMALE" | "OTHER";
    address: string | null;
    fatherName: string | null;
    motherName: string | null;
    occupation: string | null;
    religion: string | null;
    caste: string | null;
    udiseCode: string | null;
    contactNo: string | null;
    user: {
      name: string;
      email: string;
      adharNo: string;
    };
  };
  onSubmit?: () => void;
}


// ------------------------------
// COMPONENT
// ------------------------------
export default function EditStudentForm({ student, onSubmit }: EditStudentFormProps) {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<StudentEditValues>({
    resolver: zodResolver(StudentEditSchema),
    defaultValues: {
      name: student.user.name,
      email: student.user.email,
      adharNo: student.user.adharNo,
      admissionNo: student.admissionNo,
      rollNumber: student.rollNumber,
      classId: student.classId,
      dob: student.dob ? student.dob.substring(0, 10) : "",
      gender: student.gender,
      address: student.address ?? "",

      fatherName: student.fatherName ?? "",
      motherName: student.motherName ?? "",
      occupation: student.occupation ?? "",
      religion: student.religion ?? "",
      caste: student.caste ?? "",
      udiseCode: student.udiseCode ?? "",
      contactNo: student.contactNo ?? "",
    },
  });


  const handleSubmit = async (values: StudentEditValues) => {
    setLoading(true);
    setServerError("");

    try {
      const formData = new FormData();

      // Append text fields
      for (const [key, value] of Object.entries(values)) {
        if (value) formData.append(key, value);
      }

      // Append file if selected
      if (file) formData.append("file", file);

      const res = await fetch(`/api/students/${student.id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update student");

      onSubmit?.();
      router.push("/admin/students");
    } catch (err) {
      const error = err as Error;
      setServerError(error.message);
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
        {serverError && <p className="text-red-600">{serverError}</p>}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* NAME */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* EMAIL */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* AADHAR */}
              <FormField
                control={form.control}
                name="adharNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhar No</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ADMISSION NO */}
              <FormField
                control={form.control}
                name="admissionNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission No</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ROLL NO */}
              <FormField
                control={form.control}
                name="rollNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roll Number</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CLASS ID */}
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DOB */}
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DOB</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* GENDER */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ADDRESS */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* OTHER FIELDS */}
              {[
                "fatherName",
                "motherName",
                "occupation",
                "religion",
                "caste",
                "udiseCode",
                "contactNo",
              ].map((fieldName) => (
                <FormField
                  key={fieldName}
                  control={form.control}
                  name={fieldName as keyof StudentEditValues}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldName}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              {/* FILE */}
              <div className="md:col-span-2">
                <Label>Profile Image</Label>
                <Input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Student"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
