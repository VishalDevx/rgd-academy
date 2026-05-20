"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Loader2, ArrowUpRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface CurrentClass {
  id: string;
  name: string;
  grade: string;
  section: string | null;
  studentCount: number;
  nextGrade: string | null;
}

export default function PromotionPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<CurrentClass[]>([]);
  const [activeSession, setActiveSession] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);
  const [result, setResult] = useState<{ message: string; promotedCount: number; createdClasses: number; nextSession: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [sessionsRes, classesRes] = await Promise.all([
          fetch("/api/academic-sessions"),
          fetch("/api/classes"),
        ]);
        const sessionsJson = await sessionsRes.json();
        const sessions: Array<{ name: string; isActive: boolean }> = Array.isArray(sessionsJson.data) ? sessionsJson.data : [];
        const active = sessions.find((s) => s.isActive);
        setActiveSession(active?.name || "None");

        const classesJson = await classesRes.json();
        const classesData: Array<{ id: string; name: string; grade: string; section: string | null }> = Array.isArray(classesJson.data) ? classesJson.data : [];
        const classesWithCounts = await Promise.all(
          classesData.map(async (cls) => {
            const res = await fetch(`/api/students/by-class?classId=${cls.id}`);
            const json = await res.json();
            const students = Array.isArray(json.data) ? json.data : [];
            return {
              id: cls.id,
              name: cls.name,
              grade: cls.grade,
              section: cls.section,
              studentCount: students.length,
              nextGrade: getNextGradeName(cls.grade),
            };
          })
        );
        setClasses(classesWithCounts.filter((c) => c.studentCount > 0));
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const gradeOrder = ["NURSERY","LKG","UKG","ONE","TWO","THREE","FOUR","FIVE","SIX","SEVEN","EIGHT","NINE","TEN"];
  const getNextGradeName = (current: string) => {
    const idx = gradeOrder.indexOf(current);
    return idx === -1 || idx === gradeOrder.length - 1 ? null : gradeOrder[idx + 1];
  };

  const handlePromote = async () => {
    if (!confirm("Are you sure? This will promote ALL active students to the next grade. This action cannot be undone.")) return;
    setPromoting(true);
    setResult(null);
    try {
      const res = await fetch("/api/promotion", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
      toast.success(`Promoted ${data.promotedCount} students`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Promotion failed");
    } finally {
      setPromoting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const terminalClasses = classes.filter((c) => !c.nextGrade);
  const promotableClasses = classes.filter((c) => c.nextGrade);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Promotion</h1>
          <p className="text-sm text-muted-foreground">
            Active Session: <Badge variant="secondary">{activeSession}</Badge>
          </p>
        </div>
        <Button
          onClick={handlePromote}
          disabled={promoting || promotableClasses.length === 0}

        >
          {promoting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Promoting...</> : <><ArrowUpRight className="h-4 w-4 mr-2" /> Promote All Students</>}
        </Button>
      </div>

      {result && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Promotion Complete!</strong><br />
            {result.promotedCount} students promoted to <Badge variant="secondary">{result.nextSession}</Badge><br />
            {result.createdClasses} new classes created
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Classes with students</CardTitle>
          <CardDescription>Students in TEN will not be promoted (terminal grade)</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Next Grade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotableClasses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.grade}</TableCell>
                  <TableCell>{c.studentCount}</TableCell>
                  <TableCell>{c.nextGrade || "-"}</TableCell>
                  <TableCell><Badge className="bg-green-100 text-green-700">Can Promote</Badge></TableCell>
                </TableRow>
              ))}
              {terminalClasses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.grade}</TableCell>
                  <TableCell>{c.studentCount}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell><Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" /> Terminal</Badge></TableCell>
                </TableRow>
              ))}
              {classes.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No students found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
