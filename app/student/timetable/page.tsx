"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { CalendarDays } from "lucide-react";

interface TimetableEntry {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  subject: { name: string; code: string };
  teacher: { user: { name: string } } | null;
}

interface StudentData {
  id: string;
  class: { id: string; name: string } | null;
}

const DAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const FULL_DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const DISPLAY_DAYS = DAYS;
const FULL_DISPLAY_DAYS = FULL_DAYS;

export default function StudentTimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const dashRes = await fetch("/api/student/dashboard");
        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setStudent(dashData.student);

          if (dashData.student?.class?.id) {
            const ttRes = await fetch(`/api/timetable?classId=${dashData.student.class.id}`);
            if (ttRes.ok) {
              const ttData = await ttRes.json();
              setEntries(ttData.data || []);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching timetable:", error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const allTimeSlots = [...new Set(entries.map((e) => `${e.startTime}-${e.endTime}`))].sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!student?.class) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No class assigned</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Weekly Timetable</h1>
        <p className="text-gray-500 mt-1">{student.class.name}</p>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No timetable available for your class</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <div className="min-w-[800px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-3 bg-gray-50 text-left text-sm font-semibold text-gray-700 w-24">Time</th>
                    {DISPLAY_DAYS.map((day) => (
                      <th key={day.value} className="border p-3 bg-gray-50 text-center text-sm font-semibold text-gray-700">
                        {day.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allTimeSlots.map((slot) => {
                    const [start, end] = slot.split("-");
                    return (
                      <tr key={slot}>
                        <td className="border p-2 text-xs text-gray-500 font-medium">
                          {formatTime(start)} - {formatTime(end)}
                        </td>
                        {DISPLAY_DAYS.map((day) => {
                          const cellEntries = entries.filter(
                            (e) => e.dayOfWeek === day.value && e.startTime === start && e.endTime === end
                          );
                          return (
                            <td key={day.value} className="border p-1.5 align-top h-24">
                              {cellEntries.length > 0 ? cellEntries.map((entry) => (
                                <div
                                  key={entry.id}
                                  className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 h-full"
                                >
                                  <div className="font-semibold text-indigo-800 text-sm">
                                    {entry.subject.name}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {entry.subject.code}
                                  </div>
                                  {entry.teacher && (
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {entry.teacher.user.name}
                                    </div>
                                  )}
                                  {entry.room && (
                                    <Badge variant="outline" className="mt-1 text-[10px] px-1 py-0">
                                      Room {entry.room}
                                    </Badge>
                                  )}
                                </div>
                              )) : null}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatTime(time: string) {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}
