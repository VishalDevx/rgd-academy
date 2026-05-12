"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
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
  CreditCard,
  Loader2,
  Trash2,
  Eye,
} from "lucide-react";
import { IDCardClient } from "@/app/components/IDCardClient";

interface IDCardData {
  id: string;
  cardNo: string;
  issueDate: string;
  expiryDate: string | null;
  student?: {
    user: { name: string };
    class: { name: string } | null;
  };
  staff?: {
    user: { name: string };
    designation: string;
  };
}

export default function AdminIDCardsPage() {
  const [cards, setCards] = useState<IDCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    staffId: "",
    expiryDate: "",
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

  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch("/api/id-cards");
      if (res.ok) {
        const json = await res.json();
        setCards(json.data ?? []);
      }
    } catch {
      toast.error("Failed to load ID cards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const openAddDialog = async () => {
    setForm({ studentId: "", staffId: "", expiryDate: "" });
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
    if (!form.studentId && !form.staffId) {
      toast.error("Please select a student or staff");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/id-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          expiryDate: form.expiryDate || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create");
      toast.success("ID card generated");
      setDialogOpen(false);
      fetchCards();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ID card?")) return;
    try {
      const res = await fetch(`/api/id-cards/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("ID card deleted");
      fetchCards();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const filtered = cards.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = c.student?.user.name ?? c.staff?.user.name ?? "";
    return name.toLowerCase().includes(q) || c.cardNo.toLowerCase().includes(q);
  });

  if (viewId) {
    return (
      <div className="p-6 md:p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white space-y-6">
        <Button variant="ghost" onClick={() => setViewId(null)}>
          &larr; Back to ID Cards
        </Button>
        <IDCardClient cardId={viewId} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white space-y-6">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">
            ID Cards
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage ID cards for students and staff
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <CreditCard className="h-4 w-4 mr-2" />
          Generate ID Card
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle>All ID Cards ({filtered.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-8 w-48"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No ID cards found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">
                      Card No
                    </th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">
                      Issued To
                    </th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">
                      Type
                    </th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">
                      Issue Date
                    </th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">
                      Expiry
                    </th>
                    <th className="text-right py-3 px-3 font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium">{c.cardNo}</td>
                      <td className="py-3 px-3">
                        {c.student?.user.name ?? c.staff?.user.name ?? "—"}
                      </td>
                      <td className="py-3 px-3">
                        {c.student ? "Student" : "Staff"}
                      </td>
                      <td className="py-3 px-3 text-gray-500">
                        {new Date(c.issueDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-gray-500">
                        {c.expiryDate
                          ? new Date(c.expiryDate).toLocaleDateString("en-IN")
                          : "—"}
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
            <DialogTitle>Generate ID Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label>Expiry Date (optional)</Label>
              <Input
                type="date"
                value={form.expiryDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expiryDate: e.target.value }))
                }
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
