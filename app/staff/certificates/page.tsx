"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { FileText, Loader2, Eye } from "lucide-react";
import { CertificateClient } from "@/app/components/CertificateClient";
import { useSession } from "next-auth/react";
import Pagination from "@/app/components/Pagination";

interface CertificateData {
  id: string;
  certificateNo: string;
  type: string;
  issueDate: string;
}

export default function StaffCertificatesPage() {
  const { data: session } = useSession();
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewId, setViewId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(certificates.length / PAGE_SIZE);
  const paginated = certificates.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const [staffId, setStaffId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/staff/profile`)
      .then((res) => res.json())
      .then((json) => {
        if (json.staff?.id) {
          setStaffId(json.staff.id);
        }
      })
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    if (!staffId) return;
    fetch(`/api/certificates?staffId=${staffId}`)
      .then((res) => res.json())
      .then((json) => {
        setCertificates(json.data ?? []);
      })
      .catch(() => toast.error("Failed to load certificates"))
      .finally(() => setLoading(false));
  }, [staffId]);

  if (viewId) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <Button variant="ghost" onClick={() => setViewId(null)}>
          &larr; Back to Certificates
        </Button>
        <CertificateClient certificateId={viewId} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">
          My Certificates
        </h1>
        <p className="text-sm text-muted-foreground">
          View and download your certificates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certificates ({certificates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No certificates issued yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">
                      Certificate No
                    </th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">
                      Type
                    </th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">
                      Issue Date
                    </th>
                    <th className="text-right py-3 px-3 font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium">
                        {c.certificateNo}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="text-xs">
                          {c.type.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-gray-500">
                        {new Date(c.issueDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewId(c.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {certificates.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={certificates.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
