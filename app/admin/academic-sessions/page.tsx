"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Plus, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  const [name, setName] = useState("");
  const [setActive, setSetActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Session name is required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/academic-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), isActive: setActive }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Session created");
      setOpen(false);
      setName("");
      setSetActive(false);
      fetchSessions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSubmitting(false);
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Session</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Academic Session</DialogTitle>
              <DialogDescription>Add a new academic year (e.g. 2025-2026)</DialogDescription>
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
              <Button onClick={handleCreate} disabled={submitting}>{submitting ? "Creating..." : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center py-8 text-gray-500">No sessions created yet</TableCell></TableRow>
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
