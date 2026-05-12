"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Leave {
  id: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  staff: {
    user: { name: string; email: string };
    designation: string;
  };
}

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const res = await fetch("/api/leaves");
      const json = await res.json();
      setLeaves(Array.isArray(json.data) ? json.data : []);
    } catch {
      toast.error("Failed to load leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/leaves/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Leave ${status.toLowerCase()}`);
      fetchLeaves();
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const pending = leaves.filter((l) => l.status === "PENDING");
  const history = leaves.filter((l) => l.status !== "PENDING");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Staff Leave Management</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Requests</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{leaves.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{pending.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Approved</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{leaves.filter((l) => l.status === "APPROVED").length}</div></CardContent>
        </Card>
      </div>

      {pending.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Pending Requests</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead><TableHead>Designation</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Reason</TableHead><TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.staff.user.name}</TableCell>
                    <TableCell>{l.staff.designation}</TableCell>
                    <TableCell>{new Date(l.fromDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(l.toDate).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{l.reason}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600" onClick={() => handleStatus(l.id, "APPROVED")}>
                          <CheckCircle2 className="h-4 w-4 mr-1" />Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleStatus(l.id, "REJECTED")}>
                          <XCircle className="h-4 w-4 mr-1" />Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Leave History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No leave history</TableCell></TableRow>
              ) : (
                history.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.staff.user.name}</TableCell>
                    <TableCell>{new Date(l.fromDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(l.toDate).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{l.reason}</TableCell>
                    <TableCell>
                      <Badge variant={l.status === "APPROVED" ? "default" : "destructive"}>{l.status}</Badge>
                    </TableCell>
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
