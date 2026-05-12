"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StaffData {
  id: string;
  staffId: string | null;
  designation: string;
  department: string | null;
  qualification: string | null;
  experience: string | null;
  salary: number | null;
  gender: string | null;
  phone: string | null;
  active: boolean;
  joinDate: string;
  user: {
    name: string;
    email: string;
    adharNo: string | null;
  };
}

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    adharNo: "",
    designation: "",
    department: "",
    qualification: "",
    experience: "",
    salary: "",
    gender: "",
    phone: "",
    active: true,
  });

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/staff/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load staff");
        return res.json();
      })
      .then((data: StaffData) => {
        setForm({
          name: data.user.name || "",
          email: data.user.email || "",
          adharNo: data.user.adharNo || "",
          designation: data.designation || "",
          department: data.department || "",
          qualification: data.qualification || "",
          experience: data.experience || "",
          salary: data.salary?.toString() || "",
          gender: data.gender || "",
          phone: data.phone || "",
          active: data.active,
        });
      })
      .catch(() => router.push("/admin/staff"))
      .finally(() => setLoading(false));
  }, [params?.id, router]);

  const onChange = (key: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/staff/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          adharNo: form.adharNo,
          designation: form.designation,
          department: form.department,
          qualification: form.qualification,
          experience: form.experience,
          salary: form.salary ? Number(form.salary) : null,
          gender: form.gender,
          phone: form.phone,
          active: form.active,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to update staff");
      }

      toast.success("Staff updated successfully!");
      router.push("/admin/staff");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-2xl shadow-md border border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Edit Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => onChange("name", e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => onChange("email", e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Aadhar No</Label>
                <Input value={form.adharNo} onChange={(e) => onChange("adharNo", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Designation</Label>
                <Input value={form.designation} onChange={(e) => onChange("designation", e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Department</Label>
                <Input value={form.department} onChange={(e) => onChange("department", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Qualification</Label>
                <Input value={form.qualification} onChange={(e) => onChange("qualification", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Experience</Label>
                <Input value={form.experience} onChange={(e) => onChange("experience", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Salary</Label>
                <Input type="number" value={form.salary} onChange={(e) => onChange("salary", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => onChange("gender", v)}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => onChange("phone", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.active ? "active" : "inactive"} onValueChange={(v) => onChange("active", v === "active")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
