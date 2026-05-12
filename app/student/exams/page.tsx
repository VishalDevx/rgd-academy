"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Calendar,
  Clock,
  BookOpen,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { PDFDownloadButton } from "@/app/components/PDFDownloadButton";
import { usePDF } from "@/app/lib/usePDF";
import { ExamTimetablePDF } from "@/app/components/PDFTemplates";

interface ExamDateSheet {
  id: string;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string | null;
  subject: {
    id: string;
    name: string;
    code: string;
  };
}

interface Exam {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  isLocked: boolean;
  class: {
    id: string;
    name: string;
    grade: string;
    section: string | null;
  };
  dateSheet: ExamDateSheet[];
}

interface TimetableData {
  exams: Exam[];
  upcomingExams: Exam[];
  pastExams: Exam[];
  currentExams: Exam[];
  student: {
    id: string;
    admissionNo: string;
    rollNumber: string;
    class: {
      id: string;
      name: string;
      grade: string;
      section: string | null;
      subjects: Array<{
        id: string;
        name: string;
        code: string;
        teacher: { user: { name: string } } | null;
      }>;
    } | null;
  };
}

export default function StudentExamsPage() {
  const [data, setData] = useState<TimetableData | null>(null);
  const [loading, setLoading] = useState(true);
  const timetablePdf = usePDF("Exam_Timetable.pdf");

  useEffect(() => {
    async function fetchTimetable() {
      try {
        const res = await fetch("/api/student/timetable");
        if (res.ok) {
          const timetableData = await res.json();
          setData(timetableData);
        }
      } catch (error) {
        console.error("Error fetching timetable:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTimetable();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Failed to load timetable data</p>
      </div>
    );
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "UNIT_TEST":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Unit Test
          </Badge>
        );
      case "HALF_YEARLY":
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
            Half Yearly
          </Badge>
        );
      case "ANNUAL":
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
            Annual
          </Badge>
        );
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    const startDate = new Date(exam.startDate);
    const endDate = new Date(exam.endDate);

    if (now < startDate) {
      return { status: "upcoming", label: "Upcoming", icon: Clock, color: "text-blue-600" };
    } else if (now >= startDate && now <= endDate) {
      return { status: "ongoing", label: "Ongoing", icon: AlertCircle, color: "text-orange-600" };
    } else {
      return { status: "completed", label: "Completed", icon: CheckCircle2, color: "text-green-600" };
    }
  };

  const renderExamCard = (exam: Exam) => {
    const examStatus = getExamStatus(exam);
    const StatusIcon = examStatus.icon;

    return (
      <Card key={exam.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg">{exam.name}</CardTitle>
                {getCategoryBadge(exam.category)}
              </div>
              <p className="text-sm text-gray-500">{exam.class.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${examStatus.color}`} />
              <Badge variant="outline">{examStatus.label}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(exam.startDate), "MMM dd")} -{" "}
                  {format(new Date(exam.endDate), "MMM dd, yyyy")}
                </span>
              </div>
            </div>

            {exam.dateSheet && exam.dateSheet.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Exam Schedule
                </h4>
                <div className="space-y-3">
                  {exam.dateSheet
                    .sort(
                      (a, b) =>
                        new Date(a.examDate).getTime() -
                        new Date(b.examDate).getTime()
                    )
                    .map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              {schedule.subject.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({schedule.subject.code})
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(schedule.examDate), "MMM dd, yyyy")}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(schedule.startTime), "hh:mm a")} -{" "}
                              {format(new Date(schedule.endTime), "hh:mm a")}
                            </div>
                            {schedule.room && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Room: {schedule.room}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Hidden PDF content */}
      <div className="hidden"><div ref={timetablePdf.ref}>
        {data.exams.map(exam => (
          <div key={exam.id} className="mb-8">
            <ExamTimetablePDF
              examName={exam.name}
              className={exam.class.name}
              dateSheet={exam.dateSheet.map(d => ({
                date: format(new Date(d.examDate), "MMM dd, yyyy"),
                day: format(new Date(d.examDate), "EEEE"),
                subject: d.subject.name,
                time: `${format(new Date(d.startTime), "hh:mm a")} - ${format(new Date(d.endTime), "hh:mm a")}`,
                room: d.room ?? undefined,
              }))}
            />
          </div>
        ))}
      </div></div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams & Timetable</h1>
          <p className="text-gray-500 mt-1">
            {data.student.class
              ? `${data.student.class.name} - Roll No: ${data.student.rollNumber}`
              : "View your exam schedule and timetable"}
          </p>
        </div>
        {data.exams.length > 0 && (
          <PDFDownloadButton onClick={timetablePdf.generatePDF} loading={timetablePdf.loading} label="Download Timetable" variant="outline" />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Upcoming Exams
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.upcomingExams.length}</div>
            <p className="text-xs text-gray-500 mt-1">Scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ongoing Exams
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.currentExams.length}</div>
            <p className="text-xs text-gray-500 mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Completed Exams
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pastExams.length}</div>
            <p className="text-xs text-gray-500 mt-1">Finished</p>
          </CardContent>
        </Card>
      </div>

      {/* Exams Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">
            Upcoming ({data.upcomingExams.length})
          </TabsTrigger>
          <TabsTrigger value="ongoing">
            Ongoing ({data.currentExams.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({data.pastExams.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-6">
          {data.upcomingExams.length > 0 ? (
            data.upcomingExams.map((exam) => renderExamCard(exam))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No upcoming exams</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ongoing" className="space-y-4 mt-6">
          {data.currentExams.length > 0 ? (
            data.currentExams.map((exam) => renderExamCard(exam))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No ongoing exams</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-6">
          {data.pastExams.length > 0 ? (
            data.pastExams.map((exam) => renderExamCard(exam))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No past exams</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Subjects List */}
      {data.student.class && data.student.class.subjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Your Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.student.class.subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="font-medium text-gray-900">{subject.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{subject.code}</p>
                  {subject.teacher && (
                    <p className="text-xs text-gray-400 mt-1">
                      {subject.teacher.user.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
