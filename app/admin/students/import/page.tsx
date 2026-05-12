"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Loader2, Upload, Download, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ImportRow {
  row: number;
  name: string;
  email: string;
  adharNo: string;
  admissionNo: string;
  rollNumber: string;
  className?: string;
  status: "pending" | "success" | "error";
  error?: string;
}

export default function ImportStudentsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) {
        toast.error("CSV must have a header row and at least one data row");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const nameIdx = headers.indexOf("name");
      const emailIdx = headers.indexOf("email");
      const adharIdx = headers.indexOf("adharno") !== -1 ? headers.indexOf("adharno") : headers.indexOf("aadhar");
      const admissionIdx = headers.indexOf("admissionno") !== -1 ? headers.indexOf("admissionno") : headers.indexOf("admission_no");
      const rollIdx = headers.indexOf("rollnumber") !== -1 ? headers.indexOf("rollnumber") : headers.indexOf("roll_number");
      const classIdx = headers.indexOf("class") !== -1 ? headers.indexOf("class") : -1;

      if (nameIdx === -1 || emailIdx === -1 || adharIdx === -1 || admissionIdx === -1 || rollIdx === -1) {
        toast.error("CSV must have: name, email, adharNo, admissionNo, rollNumber columns");
        return;
      }

      const parsed: ImportRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        parsed.push({
          row: i + 1,
          name: cols[nameIdx] || "",
          email: cols[emailIdx] || "",
          adharNo: cols[adharIdx] || "",
          admissionNo: cols[admissionIdx] || "",
          rollNumber: cols[rollIdx] || "",
          className: classIdx !== -1 ? cols[classIdx] : undefined,
          status: "pending",
        });
      }
      setRows(parsed);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImport = async () => {
    setImporting(true);
    const updated = [...rows];

    for (let i = 0; i < updated.length; i++) {
      const r = updated[i];
      if (!r.name || !r.email || !r.adharNo || !r.admissionNo || !r.rollNumber) {
        updated[i] = { ...r, status: "error", error: "Missing required fields" };
        continue;
      }

      try {
        const fd = new FormData();
        fd.set("name", r.name);
        fd.set("email", r.email);
        fd.set("adharNo", r.adharNo);
        fd.set("admissionNo", r.admissionNo);
        fd.set("rollNumber", r.rollNumber);

        const res = await fetch("/api/students", { method: "POST", body: fd });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed");
        }
        updated[i] = { ...r, status: "success" };
      } catch (err) {
        updated[i] = { ...r, status: "error", error: err instanceof Error ? err.message : "Failed" };
      }

      setRows([...updated]);
    }

    setImporting(false);
    setImportDone(true);
    const successCount = updated.filter((r) => r.status === "success").length;
    toast.success(`Imported ${successCount} of ${updated.length} students`);
    router.refresh();
  };

  const downloadTemplate = () => {
    const csv = "name,email,adharNo,admissionNo,rollNumber,class\nJohn Doe,john@example.com,123456789012,ADM-001,01,Class 9 A\nJane Doe,jane@example.com,987654321098,ADM-002,02,Class 9 A";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bulk Import Students</h1>
          <p className="text-sm text-muted-foreground">Upload a CSV file to add multiple students at once</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />Download Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
          <CardDescription>Required columns: name, email, adharNo, admissionNo, rollNumber. Optional: class</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-blue-400 transition">
            <Upload className="h-8 w-8 text-gray-400" />
            <div>
              <p className="font-medium text-gray-600">Click to upload CSV file</p>
              <p className="text-sm text-gray-400">.csv files only</p>
            </div>
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview ({rows.length} students)</CardTitle>
              {!importDone && (
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing...</> : "Start Import"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Aadhar</TableHead><TableHead>Admission</TableHead><TableHead>Roll</TableHead><TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.row}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.adharNo}</TableCell>
                    <TableCell>{r.admissionNo}</TableCell>
                    <TableCell>{r.rollNumber}</TableCell>
                    <TableCell>
                      {r.status === "pending" && <Badge variant="outline">Pending</Badge>}
                      {r.status === "success" && <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Done</Badge>}
                      {r.status === "error" && <Badge variant="destructive" className="whitespace-nowrap"><XCircle className="h-3 w-3 mr-1" />{r.error?.slice(0, 30)}</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
