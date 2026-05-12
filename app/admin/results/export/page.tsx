"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Label } from "@/app/components/ui/label";
import { Loader2, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

interface ClassOption {
  id: string;
  name: string;
}

interface ExamOption {
  id: string;
  name: string;
  category: string;
}

export default function ResultsExportPage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses)
      .catch(() => toast.error("Failed to load classes"));
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setExams([]);
      return;
    }
    fetch(`/api/exams?classId=${selectedClass}`)
      .then((res) => res.json())
      .then(setExams)
      .catch(() => toast.error("Failed to load exams"));
  }, [selectedClass]);

  const handleExport = async (format: "json" | "csv") => {
    if (!selectedClass || !selectedExam) {
      toast.error("Please select class and exam");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/results/export?classId=${selectedClass}&examId=${selectedExam}&format=${format}`
      );
      if (!res.ok) throw new Error("Export failed");

      if (format === "csv") {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const className = classes.find((c) => c.id === selectedClass)?.name ?? "class";
        const examName = exams.find((e) => e.id === selectedExam)?.name ?? "exam";
        a.download = `${examName}_${className}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("CSV exported successfully");
      } else {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const className = classes.find((c) => c.id === selectedClass)?.name ?? "class";
        const examName = exams.find((e) => e.id === selectedExam)?.name ?? "exam";
        a.download = `${examName}_${className}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("JSON exported successfully");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">Export Results</h1>
        <p className="text-sm text-muted-foreground">Download class-wise exam results as CSV or JSON</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Exam</Label>
            <Select value={selectedExam} onValueChange={setSelectedExam} disabled={!selectedClass}>
              <SelectTrigger>
                <SelectValue placeholder={selectedClass ? "Select exam" : "Select class first"} />
              </SelectTrigger>
              <SelectContent>
                {exams.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name} ({e.category})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={() => handleExport("csv")} disabled={loading || !selectedClass || !selectedExam}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />}
              Download CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport("json")} disabled={loading || !selectedClass || !selectedExam}>
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating export...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
