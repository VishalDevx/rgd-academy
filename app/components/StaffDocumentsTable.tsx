"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Trash2, ExternalLink, Upload, Search } from "lucide-react";
import { toast } from "sonner";
import DeleteDialog from "@/app/components/DeleteDialog";
import Pagination from "@/app/components/Pagination";

interface StaffDoc {
  id: string;
  type: string;
  title: string;
  fileUrl: string;
  createdAt: string;
  staff: {
    id: string;
    staffId: string | null;
    designation: string;
    user: { name: string; email: string };
  };
}

interface StaffMember {
  id: string;
  staffId: string | null;
  user: { name: string };
}

interface Props {
  documents: StaffDoc[];
  staffMembers: StaffMember[];
}

const PAGE_SIZE = 10;

export default function StaffDocumentsTable({ documents, staffMembers }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("OTHER");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const filtered = useMemo(() => {
    if (!query) return documents;
    const q = query.toLowerCase();
    return documents.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.staff.user.name.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q)
    );
  }, [documents, query]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/staff-documents/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Document deleted");
      setDeleteId(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedStaff || !docTitle || !docFile) {
      toast.error("Staff, title, and file are required");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", docFile);
      formData.append("title", docTitle);
      formData.append("type", docType);
      formData.append("staffId", selectedStaff);

      const res = await fetch("/api/staff-documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }

      toast.success("Document uploaded");
      setUploadOpen(false);
      setSelectedStaff("");
      setDocTitle("");
      setDocType("OTHER");
      setDocFile(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>

        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" /> Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Staff Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Staff Member</label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full mt-1 rounded-md border border-gray-200 p-2 text-sm"
                >
                  <option value="">Select staff...</option>
                  {staffMembers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.user.name} ({s.staffId || "No ID"})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="e.g. Resume, Certificate" />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full mt-1 rounded-md border border-gray-200 p-2 text-sm"
                >
                  <option value="RESUME">Resume</option>
                  <option value="CERTIFICATE">Certificate</option>
                  <option value="ID_PROOF">ID Proof</option>
                  <option value="QUALIFICATION">Qualification</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">File (max 2MB)</label>
                <Input type="file" onChange={(e) => setDocFile(e.target.files?.[0] || null)} />
              </div>
              <Button onClick={handleUpload} disabled={uploading} className="w-full">
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Staff</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No documents found
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="font-medium">{doc.staff.user.name}</div>
                    <div className="text-xs text-gray-500">{doc.staff.designation}</div>
                  </TableCell>
                  <TableCell>{doc.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{doc.type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Document"
      />
    </div>
  );
}
