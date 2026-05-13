"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Plus, Loader2, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import DeleteDialog from "@/app/components/DeleteDialog";

interface Session {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export default function AcademicSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Session | null>(null);
  const [name, setName] = useState("");
  const [setActive, setSetActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/academic-sessions");
      const json = await res.json();
      setSessions(Array.isArray(json.data) ? json.data : []);
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setName("");
    setSetActive(false);
    setOpen(true);
  };

  const openEdit = (session: Session) => {
    setEditItem(session);
    setName(session.name);
    setSetActive(session.isActive);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("Session name is required"); return; }
    setSubmitting(true);
    try {
      if (editItem) {
        const res = await fetch(`/api/academic-sessions/${editItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), isActive: setActive }),
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("Session updated");
      } else {
        const res = await fetch("/api/academic-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), isActive: setActive }),
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("Session created");
      }
      setOpen(false);
      setName("");
      setSetActive(false);
      setEditItem(null);
      fetchSessions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/academic-sessions/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Session deleted");
      setDeleteId(null);
      fetchSessions();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const activeSession = sessions.find(s => s.isActive);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Academic Sessions</h1>
          <p className="text-sm text-muted-foreground">
            {activeSession ? `Active: ${activeSession.name}` : "No active session"}
          </p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Session</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">No sessions created yet</TableCell></TableRow>
              ) : (
                sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      {s.isActive ? (
                        <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(s)}>
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setDeleteId(s.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Academic Session" : "Create Academic Session"}</DialogTitle>
            <DialogDescription>Add or edit an academic year (e.g. 2025-2026)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Session Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 2025-2026" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={setActive} onChange={(e) => setSetActive(e.target.checked)} className="rounded" />
              Set as active session (deactivates current)
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Academic Session"
      />
    </div>
  );
}
