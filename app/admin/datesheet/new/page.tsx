"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/prisma"; // optional, for type inference only
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { toast } from "sonner";
import { unknown } from "zod";


interface Exam {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

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

  // Fetch exams, classes, subjects
  useEffect(() => {
    async function fetchData() {
      const examsRes = await fetch("/api/exams");
      const classesRes = await fetch("/api/classes");
      const subjectsRes = await fetch("/api/subjects");

      const examsData = await examsRes.json();
      const classesData = await classesRes.json();
      const subjectsData = await subjectsRes.json();

      setExams(examsData);
      setClasses(classesData);
      setSubjects(subjectsData);
    }

    fetchData();
  }, []);

  async function handleSubmit() {
    if (!examId || !classId || !subjectId || !examDate || !startTime || !endTime) {
      toast( "Please fill all required fields." );
      return;
    }

    const payload = {
      examId,
      classId,
      subjectId,
      examDate,
      startTime,
      endTime,
      room: room || undefined,
    };

    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create timetable");

      toast( "Timetable created successfully!" );
      router.push("/admin/datesheet");
    } catch (err) {
      toast( "Error creating timetable", );
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Add Exam Timetable</h1>

      {/* Exam */}
      <div className="space-y-1">
        <Label>Exam</Label>
        <Select value={examId} onValueChange={setExamId}>
          <SelectTrigger>
            <SelectValue placeholder="Select Exam" />
          </SelectTrigger>
          <SelectContent>
            {exams.map((exam) => (
              <SelectItem key={exam.id} value={exam.id}>{exam.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Class */}
      <div className="space-y-1">
        <Label>Class</Label>
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger>
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject */}
      <div className="space-y-1">
        <Label>Subject</Label>
        <Select value={subjectId} onValueChange={setSubjectId}>
          <SelectTrigger>
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subj) => (
              <SelectItem key={subj.id} value={subj.id}>{subj.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Exam Date */}
      <div className="space-y-1">
        <Label>Exam Date</Label>
        <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
      </div>

      {/* Start Time */}
      <div className="space-y-1">
        <Label>Start Time</Label>
        <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      </div>

      {/* End Time */}
      <div className="space-y-1">
        <Label>End Time</Label>
        <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      </div>

      {/* Room (optional) */}
      <div className="space-y-1">
        <Label>Room (Optional)</Label>
        <Input type="text" value={room} onChange={(e) => setRoom(e.target.value)} />
      </div>

      <Button className="mt-4" onClick={handleSubmit}>Add Timetable</Button>
    </div>
  );
}
