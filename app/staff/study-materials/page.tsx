"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import {
  BookOpen,
  Plus,
  Trash2,
  FileText,
  Video,
  Link as LinkIcon,
  ScrollText,
  ClipboardList,
} from "lucide-react";
import Pagination from "@/app/components/Pagination";

interface StudyMaterial {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  videoLink: string | null;
  type: string;
  createdAt: string;
  class: { name: string };
  subject: { id: string; name: string };
}

interface StaffSubject {
  id: string;
  name: string;
  code: string;
  class: { name: string; id: string } | null;
}

const MATERIAL_TYPES = ["NOTES", "PDF", "VIDEO", "REFERENCE", "ASSIGNMENT"] as const;

const typeIcons: Record<string, React.ReactNode> = {
  NOTES: <ScrollText className="h-4 w-4" />,
  PDF: <FileText className="h-4 w-4" />,
  VIDEO: <Video className="h-4 w-4" />,
  REFERENCE: <LinkIcon className="h-4 w-4" />,
  ASSIGNMENT: <ClipboardList className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  NOTES: "bg-blue-100 text-blue-700",
  PDF: "bg-red-100 text-red-700",
  VIDEO: "bg-purple-100 text-purple-700",
  REFERENCE: "bg-amber-100 text-amber-700",
  ASSIGNMENT: "bg-green-100 text-green-700",
};

export default function StaffStudyMaterialsPage() {
  const { data: session } = useSession();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [subjects, setSubjects] = useState<StaffSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [formSubjectId, setFormSubjectId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formFileUrl, setFormFileUrl] = useState("");
  const [formVideoLink, setFormVideoLink] = useState("");
  const [formType, setFormType] = useState("NOTES");
  const [submitting, setSubmitting] = useState(false);

  const fetchMaterials = useCallback(async () => {
    try {
      const res = await fetch("/api/study-materials");
      if (res.ok) {
        const data = await res.json();
        const all = data.data || [];
        const staffSubjects = subjects.map((s) => s.id);
        setMaterials(all.filter((m: StudyMaterial) => staffSubjects.includes(m.subject.id)));
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  }, [subjects]);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/staff/dashboard");
        if (res.ok) {
          const data = await res.json();
          setSubjects(data.subjects || []);
        }
      } catch (error) {
        console.error("Error fetching staff data:", error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!loading && subjects.length > 0) fetchMaterials();
  }, [fetchMaterials, loading, subjects]);

  useEffect(() => {
    if (!loading && subjects.length === 0) {
      setLoading(false);
    }
  }, [loading, subjects]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this study material?")) return;
    try {
      const res = await fetch(`/api/study-materials/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted successfully");
        fetchMaterials();
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubjectId || !formTitle) {
      toast.error("Please fill in required fields");
      return;
    }
    setSubmitting(true);
    try {
      const selectedSubject = subjects.find((s) => s.id === formSubjectId);
      const res = await fetch("/api/study-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedSubject?.class?.id,
          subjectId: formSubjectId,
          title: formTitle,
          description: formDescription || undefined,
          fileUrl: formFileUrl || undefined,
          videoLink: formVideoLink || undefined,
          type: formType,
        }),
      });
      if (res.ok) {
        toast.success("Study material created");
        setShowForm(false);
        setFormSubjectId("");
        setFormTitle("");
        setFormDescription("");
        setFormFileUrl("");
        setFormVideoLink("");
        setFormType("NOTES");
        fetchMaterials();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create");
      }
    } catch {
      toast.error("Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(materials.length / PAGE_SIZE);
  const paginated = materials.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Study Materials</h1>
          <p className="text-gray-500 mt-1">Create and manage study materials for your subjects</p>
        </div>
        {subjects.length > 0 && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Study Material</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select value={formSubjectId} onValueChange={setFormSubjectId}>
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.code}) - {s.class?.name || "No class"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MATERIAL_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Title *</Label>
                  <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Material title" />
                </div>
                <div className="space-y-2">
                  <Label>File URL</Label>
                  <Input value={formFileUrl} onChange={(e) => setFormFileUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>Video Link</Label>
                  <Input value={formVideoLink} onChange={(e) => setFormVideoLink(e.target.value)} placeholder="https://..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Optional description" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {subjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No subjects assigned to you yet</p>
          </CardContent>
        </Card>
      ) : materials.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>My Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.title}</TableCell>
                    <TableCell>{m.class.name}</TableCell>
                    <TableCell>{m.subject.name}</TableCell>
                    <TableCell>
                      <Badge className={typeColors[m.type] || ""}>
                        <span className="flex items-center gap-1">
                          {typeIcons[m.type]}
                          {m.type}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={materials.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No study materials yet. Create your first one!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
