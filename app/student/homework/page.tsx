"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/app/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { Eye, CheckCircle2, Clock } from "lucide-react";

interface HomeworkItem {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  attachment: string | null;
  class: { name: string };
  subject: { name: string };
  teacher: { user: { name: string } };
  submissions: { status: string }[];
}

export default function StudentHomeworkPage() {
  const router = useRouter();
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getSubmissionStatus = (h: HomeworkItem) => {
    if (h.submissions && h.submissions.length > 0) {
      return h.submissions[0].status;
    }
    return null;
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/homework");
        const json = await res.json();
        if (json.success) setHomework(json.data);
      } catch {
        toast.error("Failed to load homework");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Homework</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Homework</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : homework.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No homework assigned.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {homework.map((h) => {
                  const status = getSubmissionStatus(h);
                  return (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium">{h.title}</TableCell>
                      <TableCell>{h.subject.name}</TableCell>
                      <TableCell>{h.teacher?.user?.name || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={new Date(h.dueDate) < new Date() ? "destructive" : "outline"}>
                          {format(new Date(h.dueDate), "MMM dd, yyyy")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {status === "GRADED" ? (
                          <Badge variant="default" className="flex gap-1 w-fit">
                            <CheckCircle2 className="h-3 w-3" /> Graded
                          </Badge>
                        ) : status === "SUBMITTED" ? (
                          <Badge variant="secondary" className="flex gap-1 w-fit">
                            <Clock className="h-3 w-3" /> Submitted
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/student/homework/${h.id}`)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
