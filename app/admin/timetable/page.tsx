"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Badge } from "@/app/components/ui/badge";
import { Plus, Pencil, Trash2, CalendarDays, Printer } from "lucide-react";
import { usePDF } from "@/app/lib/usePDF";

interface Class {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string | null;
}

interface Staff {
  id: string;
  user: { name: string };
}

interface TimetableEntry {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  subject: { name: string; code: string };
  teacher: { user: { name: string } } | null;
  class: { name: string };
}

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const DISPLAY_DAYS = DAYS.slice(1);

export default function AdminTimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const timetablePdf = usePDF("Timetable.pdf");
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState("all");

  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    classId: "",
    subjectId: "",
    teacherId: "",
    dayOfWeek: "1",
    startTime: "",
    endTime: "",
    room: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedClassId !== "all") params.set("classId", selectedClassId);
      const res = await fetch(`/api/timetable?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  }, [selectedClassId]);

  useEffect(() => {
    async function init() {
      try {
        const [classesRes, subjectsRes, staffRes] = await Promise.all([
          fetch("/api/classes"),
          fetch("/api/subjects"),
          fetch("/api/staff"),
        ]);
        if (classesRes.ok) {
          const data = await classesRes.json();
          setClasses(data.data || []);
        }
        if (subjectsRes.ok) {
          const data = await subjectsRes.json();
          setSubjects(data.data || []);
        }
        if (staffRes.ok) {
          const data = await staffRes.json();
          setStaffList(data.data || data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!loading) fetchEntries();
  }, [fetchEntries, loading]);

  const openAddDialog = () => {
    setEditingId(null);
    setFormData({
      classId: selectedClassId !== "all" ? selectedClassId : "",
      subjectId: "",
      teacherId: "",
      dayOfWeek: "1",
      startTime: "",
      endTime: "",
      room: "",
    });
    setShowDialog(true);
  };

  const openEditDialog = (entry: TimetableEntry) => {
    setEditingId(entry.id);
    setFormData({
      classId: entry.classId,
      subjectId: entry.subjectId,
      teacherId: entry.teacherId || "",
      dayOfWeek: entry.dayOfWeek.toString(),
      startTime: entry.startTime,
      endTime: entry.endTime,
      room: entry.room || "",
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this timetable entry?")) return;
    try {
      const res = await fetch(`/api/timetable/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted successfully");
        fetchEntries();
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.classId || !formData.subjectId || !formData.startTime || !formData.endTime) {
      toast.error("Please fill in required fields");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        classId: formData.classId,
        subjectId: formData.subjectId,
        teacherId: formData.teacherId || undefined,
        dayOfWeek: parseInt(formData.dayOfWeek),
        startTime: formData.startTime,
        endTime: formData.endTime,
        room: formData.room || undefined,
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/timetable/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/timetable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        toast.success(editingId ? "Updated successfully" : "Created successfully");
        setShowDialog(false);
        fetchEntries();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save");
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubjects = subjects.filter(
    (s) => !formData.classId || s.classId === formData.classId
  );

  const getEntriesForDay = (day: number) =>
    entries.filter((e) => e.dayOfWeek === day);

  const allTimeSlots = [...new Set(entries.map((e) => `${e.startTime}-${e.endTime}`))].sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Timetable</h1>
          <p className="text-gray-500 mt-1">Manage class timetable schedules</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={timetablePdf.generatePDF}
            disabled={timetablePdf.loading || selectedClassId === "all" || entries.length === 0}
          >
            <Printer className="h-4 w-4 mr-2" />
            {timetablePdf.loading ? "Printing..." : "Print"}
          </Button>
          <Button onClick={openAddDialog} disabled={selectedClassId === "all"}>
            <Plus className="h-4 w-4 mr-2" />
            Add Period
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Label>Class:</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {selectedClassId === "all" ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Select a class to view its timetable</p>
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No timetable entries for this class. Add one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <div ref={timetablePdf.ref} className="min-w-[700px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-50 text-left text-sm font-semibold text-gray-700 w-24">Time</th>
                    {DISPLAY_DAYS.map((day) => (
                      <th key={day.value} className="border p-2 bg-gray-50 text-center text-sm font-semibold text-gray-700">
                        {day.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allTimeSlots.length > 0 ? allTimeSlots.map((slot) => {
                    const [start, end] = slot.split("-");
                    return (
                      <tr key={slot}>
                        <td className="border p-2 text-xs text-gray-500 font-medium">
                          {start} - {end}
                        </td>
                        {DISPLAY_DAYS.map((day) => {
                          const cellEntries = entries.filter(
                            (e) => e.dayOfWeek === day.value && e.startTime === start && e.endTime === end
                          );
                          return (
                            <td key={day.value} className="border p-1 align-top">
                              {cellEntries.length > 0 ? cellEntries.map((entry) => (
                                <div key={entry.id} className="bg-blue-50 border border-blue-200 rounded p-1.5 mb-1 text-xs">
                                  <div className="font-semibold text-blue-800">{entry.subject.name}</div>
                                  {entry.teacher && (
                                    <div className="text-gray-500 truncate">{entry.teacher.user.name}</div>
                                  )}
                                  {entry.room && (
                                    <div className="text-gray-400">Room: {entry.room}</div>
                                  )}
                                  <div className="flex gap-1 mt-1">
                                    <button
                                      onClick={() => openEditDialog(entry)}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(entry.id)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              )) : null}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={7} className="border p-4 text-center text-gray-500">
                        No periods scheduled
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Period" : "Add Period"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class *</Label>
                <Select
                  value={formData.classId}
                  onValueChange={(v) => setFormData({ ...formData, classId: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(v) => setFormData({ ...formData, subjectId: v })}
                  disabled={!formData.classId}
                >
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {filteredSubjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Day *</Label>
                <Select
                  value={formData.dayOfWeek}
                  onValueChange={(v) => setFormData({ ...formData, dayOfWeek: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DISPLAY_DAYS.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>{day.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Teacher</Label>
                <Select
                  value={formData.teacherId}
                  onValueChange={(v) => setFormData({ ...formData, teacherId: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No teacher</SelectItem>
                    {staffList.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Room</Label>
                <Input
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="e.g. Room 101"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
