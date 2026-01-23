"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  FileText,
  Plus,
  BookOpen,
  Users,
  TrendingUp,
  Calendar,
  GraduationCap,
} from "lucide-react";

interface Result {
  id: string;
  marks: number;
  maxMarks: number;
  grade: string | null;
  remarks: string | null;
  createdAt: string;
  exam: {
    id: string;
    name: string;
    category: string;
    startDate: string;
  };
  subject: {
    id: string;
    name: string;
    code: string;
  };
  student: {
    id: string;
    rollNumber: string;
    user: {
      name: string;
    };
  };
}

interface Class {
  id: string;
  name: string;
  grade: string;
  section: string | null;
}

interface Exam {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate?: string;
}

export default function StaffResultsPage() {
  const searchParams = useSearchParams();
  const classIdParam = searchParams.get("classId");
  const examIdParam = searchParams.get("examId");
  const studentIdParam = searchParams.get("studentId");

  const [results, setResults] = useState<Result[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string>(
    classIdParam || "all"
  );
  const [selectedExamId, setSelectedExamId] = useState<string>(
    examIdParam || "all"
  );

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch classes
        const dashboardRes = await fetch("/api/staff/dashboard");
        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json();
          setClasses(dashboardData.classes || []);
        }

        // Fetch exams
        const examsUrl =
          selectedClassId === "all"
            ? "/api/exams"
            : `/api/exams?classId=${selectedClassId}`;
        const examsRes = await fetch(examsUrl);
        if (examsRes.ok) {
          const examsData = await examsRes.json();
          setExams(examsData.data || []);
        }

        // Fetch results
        await fetchResults();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchResults();
    }
  }, [selectedClassId, selectedExamId]);

  const fetchResults = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedClassId !== "all") {
        params.append("classId", selectedClassId);
      }
      if (selectedExamId !== "all") {
        params.append("examId", selectedExamId);
      }
      if (studentIdParam) {
        params.append("studentId", studentIdParam);
      }

      const res = await fetch(`/api/results?${params.toString()}`);
      if (res.ok) {
        const resultsData = await res.json();
        setResults(resultsData);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Group results by exam and student
  const resultsByExam = results.reduce((acc, result) => {
    const examId = result.exam.id;
    if (!acc[examId]) {
      acc[examId] = {
        exam: result.exam,
        students: {},
      };
    }
    const studentId = result.student.id;
    if (!acc[examId].students[studentId]) {
      acc[examId].students[studentId] = {
        student: result.student,
        results: [],
      };
    }
    acc[examId].students[studentId].results.push(result);
    return acc;
  }, {} as Record<string, { exam: Exam; students: Record<string, { student: Result["student"]; results: Result[] }> }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results Management</h1>
          <p className="text-gray-500 mt-1">
            View and manage exam results for your classes
          </p>
        </div>
        <Link href="/staff/results/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Results
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Class:</label>
              <Select
                value={selectedClassId}
                onValueChange={setSelectedClassId}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Exam:</label>
              <Select
                value={selectedExamId}
                onValueChange={setSelectedExamId}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Results
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
            <p className="text-xs text-gray-500 mt-1">Records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Students
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(results.map((r) => r.student.id)).size}
            </div>
            <p className="text-xs text-gray-500 mt-1">With results</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Exams
            </CardTitle>
            <BookOpen className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(results.map((r) => r.exam.id)).size}
            </div>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {results.length > 0
                ? Math.round(
                    (results.reduce((sum, r) => sum + (r.marks / r.maxMarks) * 100, 0) /
                      results.length) *
                      100
                  ) / 100
                : 0}
              %
            </div>
            <p className="text-xs text-gray-500 mt-1">Overall</p>
          </CardContent>
        </Card>
      </div>

      {/* Results by Exam */}
      {Object.keys(resultsByExam).length > 0 ? (
        <div className="space-y-6">
          {Object.values(resultsByExam).map((examGroup) => (
            <Card key={examGroup.exam.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{examGroup.exam.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(examGroup.exam.startDate), "MMM dd, yyyy")} •{" "}
                      {examGroup.exam.category}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {Object.keys(examGroup.students).length} students
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.values(examGroup.students).map((studentGroup) => (
                    <div
                      key={studentGroup.student.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {studentGroup.student.user.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Roll No: {studentGroup.student.rollNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            Total:{" "}
                            {studentGroup.results.reduce((sum, r) => sum + r.marks, 0)} /{" "}
                            {studentGroup.results.reduce((sum, r) => sum + r.maxMarks, 0)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {Math.round(
                              (studentGroup.results.reduce(
                                (sum, r) => sum + (r.marks / r.maxMarks) * 100,
                                0
                              ) /
                                studentGroup.results.length) *
                                100
                            ) / 100}
                            %
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {studentGroup.results.map((result) => (
                          <div
                            key={result.id}
                            className="p-2 bg-gray-50 rounded text-sm"
                          >
                            <p className="font-medium text-gray-900">
                              {result.subject.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {result.marks} / {result.maxMarks}
                            </p>
                            {result.grade && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {result.grade}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No results found</p>
            <Link href="/staff/results/new">
              <Button variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Results
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
