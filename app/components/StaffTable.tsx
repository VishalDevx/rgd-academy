"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { KeyRound, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Staff {
  id: string;
  user: { name: string; email: string };
  designation: string;
  salary: number | null;
  active: boolean;
  department: string | null;
}

type Props = {
  staff: Staff[];
};

const MotionTableRow = motion(TableRow);

export default function StaffTable({ staff }: Props) {
  const router = useRouter();
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [resetPassword, setResetPassword] = useState<string | null>(null);

  const handleResetPassword = async (staffId: string, staffName: string) => {
    setResettingId(staffId);
    try {
      const res = await fetch(`/api/staff/${staffId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to reset password");
      }

      const data = await res.json();
      setResetPassword(data.defaultPassword);
      toast.success(`Password reset successfully for ${staffName}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
      setOpenDialogId(null);
    } finally {
      setResettingId(null);
    }
  };

  const handleDelete = async (staffId: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/staff/${staffId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete staff");
      toast.success("Staff deleted successfully");
      setDeleteDialogId(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Table className="min-w-full divide-y divide-gray-200">
      <TableHeader>
        <TableRow className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100">
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Designation</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Salary</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {staff.map((s) => (
          <MotionTableRow
            key={s.id}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(243,244,246,0.5)" }}
            transition={{ duration: 0.2 }}
          >
            <TableCell>{s.user.name}</TableCell>
            <TableCell>{s.user.email}</TableCell>
            <TableCell>{s.designation}</TableCell>
            <TableCell>{s.department || "-"}</TableCell>
            <TableCell>{s.salary ? `₹${s.salary.toLocaleString()}` : "-"}</TableCell>
            <TableCell>
              <Badge variant={s.active ? "default" : "destructive"}>
                {s.active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Link href={`/admin/staff/${s.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </Link>

                <Dialog
                  open={openDialogId === s.id}
                  onOpenChange={(open) => {
                    setOpenDialogId(open ? s.id : null);
                    if (!open) setResetPassword(null);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDialogId(s.id);
                      }}
                    >
                      <KeyRound className="h-4 w-4 mr-1" />
                      Reset Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to reset the password for {s.user.name}?
                        {resetPassword && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm font-semibold text-green-800 mb-1">New Password:</p>
                            <p className="text-lg font-mono text-green-900 bg-white p-2 rounded border">{resetPassword}</p>
                            <p className="text-xs text-green-700 mt-2">Please share this password securely.</p>
                          </div>
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      {resetPassword ? (
                        <Button onClick={() => { setOpenDialogId(null); setResetPassword(null); }}>Close</Button>
                      ) : (
                        <>
                          <Button variant="outline" onClick={() => setOpenDialogId(null)}>Cancel</Button>
                          <Button onClick={() => handleResetPassword(s.id, s.user.name)} disabled={resettingId === s.id}>
                            {resettingId === s.id ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Resetting...</> : "Reset Password"}
                          </Button>
                        </>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={deleteDialogId === s.id} onOpenChange={(open) => setDeleteDialogId(open ? s.id : null)}>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); setDeleteDialogId(s.id); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Staff</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to permanently delete {s.user.name}? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteDialogId(null)}>Cancel</Button>
                      <Button variant="destructive" onClick={() => handleDelete(s.id)} disabled={deleting}>
                        {deleting ? "Deleting..." : "Delete"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TableCell>
          </MotionTableRow>
        ))}
      </TableBody>
    </Table>
  );
}
