"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { toast } from "sonner";

interface Exam { id: string; name: string; }
interface Class { id: string; name: string; }
interface Subject { id: string; name: string; }

export default function AddTimeTablePage() {
  const router = useRouter();

  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch exams, classes, subjects
  useEffect(() => {
    async function fetchData() {
      try {
        const [examsRes, classesRes, subjectsRes] = await Promise.all([
          fetch("/api/exams"),
          fetch("/api/classes"),
          fetch("/api/subjects"),
        ]);

        const examsData = await examsRes.json();
        const classesData = await classesRes.json();
        const subjectsData = await subjectsRes.json();

        if (!Array.isArray(examsData.data) || !Array.isArray(classesData.data) || !Array.isArray(subjectsData.data)) {
          toast.error("Invalid data from server");
          return;
        }

        setExams(examsData.data);
        setClasses(classesData.data);
        setSubjects(subjectsData.data);
      } catch (err) {
        toast.error("Failed to load data");
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!examId || !classId || !subjectId || !examDate || !startTime || !endTime) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);
    const payload = { examId, classId, subjectId, examDate, startTime, endTime, room: room || undefined };

    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Timetable created successfully!");
      router.push("/admin/date-sheet");
    } catch (err) {
      toast.error("Error creating timetable: " + String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Add Exam Timetable</h1>

      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Exam</Label>
          <Select value={examId} onValueChange={setExamId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Class</Label>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Subject</Label>
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Exam Date</Label>
          <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label>Start Time</Label>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label>End Time</Label>
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label>Room (Optional)</Label>
          <Input type="text" value={room} onChange={(e) => setRoom(e.target.value)} />
        </div>

        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : "Add Timetable"}
        </Button>
      </div>
    </div>
  );
}
