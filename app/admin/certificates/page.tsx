"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Search,
  FileText,
  Loader2,
  Eye,
  Trash2,
  Download,
} from "lucide-react";
import Link from "next/link";
import { CertificateClient } from "@/app/components/CertificateClient";

interface CertificateData {
  id: string;
  certificateNo: string;
  type: string;
  issueDate: string;
  remarks: string | null;
  student?: {
    user: { name: string };
    class: { name: string } | null;
  };
  staff?: {
    user: { name: string };
    designation: string;
  };
}

const CERT_TYPES = [
  "BONAFIDE",
  "CHARACTER",
  "TRANSFER",
  "STUDY",
  "FEE_CLEARANCE",
  "NO_DUES",
  "ACHIEVEMENT",
  "PARTICIPATION",
  "EXPERIENCE",
  "JOINING_LETTER",
];

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    type: "",
    studentId: "",
    staffId: "",
    remarks: "",
  });
  const [saving, setSaving] = useState(false);

  const [studentOptions, setStudentOptions] = useState<
    { id: string; user: { name: string }; class: { name: string } | null }[]
  >([]);
  const [staffOptions, setStaffOptions] = useState<
    { id: string; user: { name: string }; designation: string }[]
  >([]);
  const [entityType, setEntityType] = useState<"student" | "staff">("student");

  const [viewId, setViewId] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      const res = await fetch(`/api/certificates?${params}`);
      if (res.ok) {
        const json = await res.json();
        setCertificates(json.data ?? []);
      }
    } catch {
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const openAddDialog = async () => {
    setForm({ type: "", studentId: "", staffId: "", remarks: "" });
    setEntityType("student");
    try {
      const [sRes, stRes] = await Promise.all([
        fetch("/api/students?active=true"),
        fetch("/api/staff"),
      ]);
      if (sRes.ok) {
        const sJson = await sRes.json();
        setStudentOptions(sJson.data ?? sJson);
      }
      if (stRes.ok) {
        const stJson = await stRes.json();
        setStaffOptions(stJson.data ?? stJson);
      }
    } catch {
      toast.error("Failed to load options");
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.type) {
      toast.error("Please select certificate type");
      return;
    }
    if (!form.studentId && !form.staffId) {
      toast.error("Please select a student or staff");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create");
      toast.success("Certificate generated");
      setDialogOpen(false);
      fetchCertificates();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;
    try {
      const res = await fetch(`/api/certificates/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Certificate deleted");
      fetchCertificates();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const filtered = certificates.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name =
      c.student?.user.name ?? c.staff?.user.name ?? "";
    return (
      name.toLowerCase().includes(q) ||
      c.certificateNo.toLowerCase().includes(q)
    );
  });

  if (viewId) {
    return (
      <div className="p-6 md:p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white space-y-6">
        <Button variant="ghost" onClick={() => setViewId(null)}>
          &larr; Back to Certificates
        </Button>
        <CertificateClient certificateId={viewId} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white space-y-6">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">
            Certificates
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage certificates for students and staff
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <FileText className="h-4 w-4 mr-2" />
          Generate Certificate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle>All Certificates ({filtered.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  className="pl-8 w-48"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  {CERT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No certificates found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">
                      Certificate No
                    </th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">
                      Type
                    </th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">
                      Issued To
                    </th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">
                      Issue Date
                    </th>
                    <th className="text-right py-3 px-3 font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium">
                        {c.certificateNo}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="text-xs">
                          {c.type.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        {c.student?.user.name ?? c.staff?.user.name ?? "—"}
                        <span className="text-xs text-gray-400 ml-1">
                          ({c.student?.class?.name ?? c.staff?.designation ?? ""})
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-500">
                        {new Date(c.issueDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewId(c.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Link
                            href={`/api/certificates/${c.id}/pdf`}
                            target="_blank"
                          >
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(c.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Certificate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Certificate Type</Label>
              <Select
                value={form.type}
                onValueChange={(val) =>
                  setForm((f) => ({ ...f, type: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {CERT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Issue To</Label>
              <Select
                value={entityType}
                onValueChange={(val) => {
                  setEntityType(val as "student" | "staff");
                  setForm((f) => ({ ...f, studentId: "", staffId: "" }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {entityType === "student" ? (
              <div>
                <Label>Student</Label>
                <Select
                  value={form.studentId}
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, studentId: val, staffId: "" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.user.name} — {s.class?.name ?? "No Class"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label>Staff</Label>
                <Select
                  value={form.staffId}
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, staffId: val, studentId: "" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.user.name} — {s.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Remarks (optional)</Label>
              <Input
                value={form.remarks}
                onChange={(e) =>
                  setForm((f) => ({ ...f, remarks: e.target.value }))
                }
                placeholder="Purpose of certificate"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
