"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import {
  RefreshCw,
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  History,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface CronJobInfo {
  name: string;
  description: string;
  schedule: string;
}

interface CronExecution {
  id: string;
  action: string;
  createdAt: string;
  newValue: {
    message?: string;
    error?: string;
    stats?: Record<string, number>;
    durationMs?: number;
  } | null;
}

const CRON_JOBS: CronJobInfo[] = [
  { name: "attendance-reminder", description: "Send attendance alerts to students marked ABSENT today", schedule: "30 18 * * 1-5" },
  { name: "fee-reminder", description: "Send fee reminders to students with due/overdue payments", schedule: "0 6 * * *" },
  { name: "daily-digest", description: "Send daily summary stats to admin", schedule: "0 20 * * *" },
  { name: "promote-students", description: "Promote all active students to next grade", schedule: "35 18 31 3 *" },
];

function scheduleDescription(schedule: string): string {
  const parts = schedule.split(" ");
  if (parts.length !== 5) return schedule;
  const [min, hour, day, month, week] = parts;
  if (day === "*" && month === "*" && week === "1-5") return "Weekdays";
  if (day === "*" && month === "*" && week === "*") return "Daily";
  if (hour === "6" && day === "*") return "Daily at 6:00 AM";
  if (hour === "20") return "Daily at 8:00 PM";
  if (hour === "18" && day === "31" && month === "3") return "Yearly (Mar 31)";
  if (hour === "18" && week === "1-5") return "Weekdays at 6:30 PM";
  return `${hour.padStart(2, "0")}:${min.padStart(2, "0")} UTC`;
}

export default function CronJobsPage() {
  const [executions, setExecutions] = useState<Record<string, CronExecution[]>>({});
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/logs?entity=CRON_JOB&limit=100");
      const data = await res.json();
      const grouped: Record<string, CronExecution[]> = {};
      for (const job of CRON_JOBS) {
        grouped[job.name] = [];
      }
      if (data.logs) {
        for (const log of data.logs) {
          const name = log.entityId;
          if (name && grouped[name]) {
            grouped[name].push(log);
          }
        }
      }
      for (const name of Object.keys(grouped)) {
        grouped[name].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      setExecutions(grouped);
    } catch {
      toast.error("Failed to load execution history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const triggerJob = async (name: string) => {
    setRunning(name);
    try {
      const res = await fetch(`/api/cron/${name}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`"${name}" completed: ${data.message}`);
      } else {
        toast.error(`"${name}" failed: ${data.error}`);
      }
      fetchHistory();
    } catch {
      toast.error(`Failed to trigger "${name}"`);
    } finally {
      setRunning(null);
    }
  };

  const getLastStatus = (name: string): { status: string; time: string } | null => {
    const jobs = executions[name];
    if (!jobs || jobs.length === 0) return null;
    const last = jobs[0];
    if (last.action === "CRON_COMPLETE") return { status: "success", time: last.createdAt };
    if (last.action === "CRON_FAILED") return { status: "failed", time: last.createdAt };
    if (last.action === "CRON_START") return { status: "running", time: last.createdAt };
    return null;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scheduled Jobs</h1>
          <p className="text-sm text-muted-foreground">Monitor and trigger automated cron jobs</p>
        </div>
        <Button variant="outline" onClick={fetchHistory} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {CRON_JOBS.map((job) => {
          const lastStatus = getLastStatus(job.name);
          return (
            <Card key={job.name} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm capitalize">{job.name.replace(/-/g, " ")}</CardTitle>
                    <CardDescription className="text-xs mt-1">{job.description}</CardDescription>
                  </div>
                  {lastStatus?.status === "success" && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
                  {lastStatus?.status === "failed" && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                  {lastStatus?.status === "running" && <Loader2 className="h-5 w-5 text-blue-500 animate-spin shrink-0" />}
                  {!lastStatus && <Clock className="h-5 w-5 text-gray-300 shrink-0" />}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{scheduleDescription(job.schedule)}</span>
                  </div>
                  {lastStatus && (
                    <div className="flex items-center gap-1">
                      <History className="h-3 w-3" />
                      <span>{format(new Date(lastStatus.time), "MMM dd, h:mm a")}</span>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => triggerJob(job.name)}
                  disabled={running === job.name}
                >
                  {running === job.name ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {running === job.name ? "Running..." : "Run Now"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Execution History
          </CardTitle>
          <CardDescription>Recent cron job runs and their results</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(executions).flatMap(([name, jobs]) =>
                  jobs.slice(0, 5).map((exec) => (
                    <TableRow key={exec.id}>
                      <TableCell className="font-medium capitalize">{name.replace(/-/g, " ")}</TableCell>
                      <TableCell>
                        {exec.action === "CRON_COMPLETE" && (
                          <Badge className="bg-green-100 text-green-700">Success</Badge>
                        )}
                        {exec.action === "CRON_FAILED" && (
                          <Badge className="bg-red-100 text-red-700">Failed</Badge>
                        )}
                        {exec.action === "CRON_START" && (
                          <Badge className="bg-blue-100 text-blue-700">Running</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(exec.createdAt), "MMM dd, yyyy h:mm a")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {exec.newValue?.durationMs != null
                          ? `${(exec.newValue.durationMs / 1000).toFixed(1)}s`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate">
                        {exec.newValue?.message || exec.newValue?.error || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
