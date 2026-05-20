"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import DeleteDialog from "@/app/components/DeleteDialog";
import Pagination from "@/app/components/Pagination";

type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  visibleRoles: { role: string }[];
};

export default function AdminAnnouncementsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const PAGE_SIZE = 9;
  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const paginated = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements");
      const json = await res.json();
      setItems(Array.isArray(json.data) ? json.data : []);
    } catch {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/announcements/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Announcement deleted");
      setDeleteId(null);
      fetchAnnouncements();
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold">
          Announcements
        </h1>
        <Button asChild>
          <Link href="/admin/announcements/new"><Plus className="h-4 w-4 mr-2" />New Announcement</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">No announcements found</div>
        ) : (
          paginated.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg md:text-xl font-bold text-gray-800">{a.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/announcements/${a.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(a.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </CardHeader>
              <CardContent className="p-4 bg-white">
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">{a.content}</p>
                <p className="text-xs text-gray-500 mt-3">
                  <span className="font-semibold text-gray-600">Visible to:</span>{" "}
                  {a.visibleRoles.map((v) => v.role).join(", ") || "All"}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={items.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Announcement"
      />
    </div>
  );
}
