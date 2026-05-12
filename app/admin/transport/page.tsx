"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Search, Bus, Loader2, XCircle, CheckCircle, Edit } from "lucide-react";

interface TransportStudent {
  id: string;
  studentId: string;
  routeName: string | null;
  stopName: string | null;
  busNumber: string | null;
  driverName: string | null;
  driverPhone: string | null;
  feeAmount: number | null;
  isActive: boolean;
  student: {
    id: string;
    user: { name: string; email: string };
    class: { name: string } | null;
  };
}

interface StudentOption {
  id: string;
  user: { name: string };
  class: { name: string } | null;
  usesTransport: boolean;
}

export default function AdminTransportPage() {
  const [assignments, setAssignments] = useState<TransportStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);
  const [form, setForm] = useState({
    studentId: "",
    routeName: "",
    stopName: "",
    busNumber: "",
    driverName: "",
    driverPhone: "",
    feeAmount: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchAssignments = useCallback(async () => {
    try {
      const url = filter === "all"
        ? "/api/transport"
        : `/api/transport/by-status?isActive=${filter === "active"}`;
      const res = await fetch(url);
      if (res.ok) {
        setAssignments(await res.json());
      }
    } catch {
      toast.error("Failed to load transport assignments");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const openAddDialog = async () => {
    setEditingId(null);
    setForm({ studentId: "", routeName: "", stopName: "", busNumber: "", driverName: "", driverPhone: "", feeAmount: "" });
    try {
      const res = await fetch("/api/students?active=true");
      if (res.ok) {
        const students: StudentOption[] = await res.json();
        setStudentOptions(students);
      }
    } catch {
      toast.error("Failed to load students");
    }
    setDialogOpen(true);
  };

  const openEditDialog = async (assignment: TransportStudent) => {
    setEditingId(assignment.id);
    setForm({
      studentId: assignment.studentId,
      routeName: assignment.routeName ?? "",
      stopName: assignment.stopName ?? "",
      busNumber: assignment.busNumber ?? "",
      driverName: assignment.driverName ?? "",
      driverPhone: assignment.driverPhone ?? "",
      feeAmount: assignment.feeAmount?.toString() ?? "",
    });
    try {
      const res = await fetch("/api/students?active=true");
      if (res.ok) {
        setStudentOptions(await res.json());
      }
    } catch {
      toast.error("Failed to load students");
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.studentId) {
      toast.error("Please select a student");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/transport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          feeAmount: form.feeAmount ? Number(form.feeAmount) : null,
          isActive: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success(editingId ? "Transport assignment updated" : "Transport assignment created");
      setDialogOpen(false);
      fetchAssignments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (assignment: TransportStudent) => {
    try {
      const res = await fetch("/api/students/transport", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: assignment.studentId,
          usesTransport: !assignment.isActive,
        }),
      });
      if (!res.ok) throw new Error("Failed to toggle");
      toast.success(`Transport ${!assignment.isActive ? "enabled" : "disabled"}`);
      fetchAssignments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle");
    }
  };

  const filtered = assignments.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.student.user.name.toLowerCase().includes(q) ||
      a.student.class?.name?.toLowerCase().includes(q) ||
      a.routeName?.toLowerCase().includes(q) ||
      a.busNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white space-y-6">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">Transport Management</h1>
          <p className="text-sm text-muted-foreground">Manage student transport assignments</p>
        </div>
        <Button onClick={openAddDialog}>
          <Bus className="h-4 w-4 mr-2" />
          Add Transport Assignment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle>Transport Assignments ({filtered.length})</CardTitle>
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
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
              <Bus className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No transport assignments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">Student</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">Class</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">Route</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">Bus No</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">Driver</th>
                    <th className="text-right py-3 px-3 font-semibold text-gray-600">Fee</th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-600">Status</th>
                    <th className="text-right py-3 px-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium">{a.student.user.name}</td>
                      <td className="py-3 px-3 text-gray-500">{a.student.class?.name ?? "—"}</td>
                      <td className="py-3 px-3">
                        {a.routeName ? (
                          <div>
                            <span>{a.routeName}</span>
                            {a.stopName && <span className="text-xs text-gray-400 ml-1">({a.stopName})</span>}
                          </div>
                        ) : "—"}
                      </td>
                      <td className="py-3 px-3">{a.busNumber ?? "—"}</td>
                      <td className="py-3 px-3">
                        {a.driverName ? (
                          <div>
                            <span>{a.driverName}</span>
                            {a.driverPhone && <span className="text-xs text-gray-400 ml-1">({a.driverPhone})</span>}
                          </div>
                        ) : "—"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {a.feeAmount ? `₹${Number(a.feeAmount).toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {a.isActive ? (
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(a)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleActive(a)}
                            title={a.isActive ? "Disable transport" : "Enable transport"}
                          >
                            {a.isActive ? (
                              <XCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
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
            <DialogTitle>{editingId ? "Edit Transport Assignment" : "Add Transport Assignment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student</Label>
              <Select
                value={form.studentId}
                onValueChange={(val) => setForm((f) => ({ ...f, studentId: val }))}
                disabled={!!editingId}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Route Name</Label>
                <Input value={form.routeName} onChange={(e) => setForm((f) => ({ ...f, routeName: e.target.value }))} placeholder="e.g. Route 1" />
              </div>
              <div>
                <Label>Stop Name</Label>
                <Input value={form.stopName} onChange={(e) => setForm((f) => ({ ...f, stopName: e.target.value }))} placeholder="e.g. Main Stop" />
              </div>
              <div>
                <Label>Bus Number</Label>
                <Input value={form.busNumber} onChange={(e) => setForm((f) => ({ ...f, busNumber: e.target.value }))} placeholder="e.g. UP-01" />
              </div>
              <div>
                <Label>Fee Amount</Label>
                <Input type="number" value={form.feeAmount} onChange={(e) => setForm((f) => ({ ...f, feeAmount: e.target.value }))} placeholder="Transport fee" />
              </div>
              <div>
                <Label>Driver Name</Label>
                <Input value={form.driverName} onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value }))} placeholder="Driver name" />
              </div>
              <div>
                <Label>Driver Phone</Label>
                <Input value={form.driverPhone} onChange={(e) => setForm((f) => ({ ...f, driverPhone: e.target.value }))} placeholder="Phone number" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingId ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
