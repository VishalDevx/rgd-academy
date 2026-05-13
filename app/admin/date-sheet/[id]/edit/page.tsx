"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { toast } from "sonner";

interface Exam { id: string; name: string }
interface Class { id: string; name: string }
interface Subject { id: string; name: string }

export default function EditTimeTablePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const makeDateTime = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return null;
    const dt = new Date(`${dateStr}T${timeStr}:00`);
    return isNaN(dt.getTime()) ? null : dt;
  };

  useEffect(() => {
    (async () => {
      try {
        const [entryRes, examsRes, classesRes, subjectsRes] = await Promise.all([
          fetch(`/api/dateSheet/${id}`),
          fetch("/api/exams"),
          fetch("/api/classes"),
          fetch("/api/subjects"),
        ]);
        const entryJson = await entryRes.json();
        const entry = entryJson.data || entryJson;

        setExamId(entry.examId || entry.exam?.id || "");
        setClassId(entry.classId || entry.class?.id || "");
        setSubjectId(entry.subjectId || entry.subject?.id || "");
        setExamDate(entry.examDate ? entry.examDate.split("T")[0] : "");
        setStartTime(entry.startTime ? new Date(entry.startTime).toTimeString().slice(0, 5) : "");
        setEndTime(entry.endTime ? new Date(entry.endTime).toTimeString().slice(0, 5) : "");
        setRoom(entry.room || "");

        const examsJson = await examsRes.json();
        const classesJson = await classesRes.json();
        const subjectsJson = await subjectsRes.json();

        if (Array.isArray(examsJson.data)) setExams(examsJson.data);
        if (Array.isArray(classesJson.data)) setClasses(classesJson.data);
        if (Array.isArray(subjectsJson.data)) setSubjects(subjectsJson.data);
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async () => {
    if (!examId || !classId || !subjectId || !examDate || !startTime || !endTime) {
      toast.error("All fields are required");
      return;
    }

    const startDateTime = makeDateTime(examDate, startTime);
    const endDateTime = makeDateTime(examDate, endTime);
    if (!startDateTime || !endDateTime) {
      toast.error("Invalid time selected");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/dateSheet/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          classId,
          subjectId,
          examDate: new Date(examDate),
          startTime: startDateTime,
          endTime: endDateTime,
          room: room || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Updated successfully!");
      router.push("/admin/date-sheet");
      router.refresh();
    } catch {
      toast.error("Error updating");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Edit Exam Timetable</h1>
      <div className="space-y-1">
        <Label>Exam</Label>
        <Select value={examId} onValueChange={setExamId}>
          <SelectTrigger><SelectValue placeholder="Select Exam" /></SelectTrigger>
          <SelectContent>
            {exams.map((exam) => (
              <SelectItem key={exam.id} value={exam.id}>{exam.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Class</Label>
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Subject</Label>
        <Select value={subjectId} onValueChange={setSubjectId}>
          <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
          <SelectContent>
            {subjects.map((subj) => (
              <SelectItem key={subj.id} value={subj.id}>{subj.name}</SelectItem>
            ))}
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
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Updating..." : "Update Timetable"}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </div>
  );
}
