"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Document {
  id: string;
  type: string;
  title: string;
  fileUrl: string;
  createdAt: string;
}

export default function DocumentsViewer({ studentId }: { studentId: string }) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/students/${studentId}/documents`)
      .then((res) => res.json())
      .then((json) => setDocs(Array.isArray(json.data) ? json.data : []))
      .catch(() => toast.error("Failed to load documents"))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  if (docs.length === 0) {
    return <p className="text-gray-500 text-sm">No documents uploaded yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {docs.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-medium text-sm">{doc.title}</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">{doc.type}</Badge>
                <span className="text-xs text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-1" /> View
            </Button>
          </a>
        </div>
      ))}
    </div>
  );
}
