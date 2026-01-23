"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  BookOpen,
  Trophy,
  TrendingUp,
  FileText,
  Download,
  Calendar,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

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
    endDate: string;
  };
  subject: {
    id: string;
    name: string;
    code: string;
  };
}

export default function StudentResultsPage() {
  const { data: session } = useSession();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        if (!session?.user?.id) return;

        // For students, the API automatically filters by their student record
        const res = await fetch("/api/results");
        if (res.ok) {
          const resultsData = await res.json();
          setResults(resultsData);
        }
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Group results by exam
  const resultsByExam = results.reduce((acc, result) => {
    const examId = result.exam.id;
    if (!acc[examId]) {
      acc[examId] = {
        exam: result.exam,
        results: [],
      };
    }
    acc[examId].results.push(result);
    return acc;
  }, {} as Record<string, { exam: Result["exam"]; results: Result[] }>);

  const examGroups = Object.values(resultsByExam);
  const uniqueExams = examGroups.map((g) => g.exam);

  // Calculate overall statistics
  const totalMarks = results.reduce((sum, r) => sum + r.marks, 0);
  const totalMaxMarks = results.reduce((sum, r) => sum + r.maxMarks, 0);
  const overallPercentage =
    totalMaxMarks > 0 ? Math.round((totalMarks / totalMaxMarks) * 100) : 0;

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 75) return "A";
    if (percentage >= 60) return "B";
    if (percentage >= 40) return "C";
    return "D";
  };

  const selectedExamGroup = selectedExam
    ? examGroups.find((g) => g.exam.id === selectedExam)
    : examGroups[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results & Marksheets</h1>
          <p className="text-gray-500 mt-1">View your exam results and performance</p>
        </div>
        {session?.user?.id && (
          <Link href={`/admin/marksheet/${session.user.id}`}>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download Marksheet
            </Button>
          </Link>
        )}
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Overall Percentage
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getGradeColor(overallPercentage)}`}>
              {overallPercentage}%
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Grade: {getGrade(overallPercentage)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Marks
            </CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalMarks} / {totalMaxMarks}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {results.length} subject{results.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Exams Completed
            </CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{uniqueExams.length}</div>
            <p className="text-sm text-gray-500 mt-1">Total exams</p>
          </CardContent>
        </Card>
      </div>

      {/* Exam Selector */}
      {uniqueExams.length > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {uniqueExams.map((exam) => (
                <Button
                  key={exam.id}
                  variant={selectedExam === exam.id ? "default" : "outline"}
                  onClick={() => setSelectedExam(exam.id)}
                >
                  {exam.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results by Exam */}
      {selectedExamGroup && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedExamGroup.exam.name}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                {format(new Date(selectedExamGroup.exam.startDate), "MMM dd")} -{" "}
                {format(new Date(selectedExamGroup.exam.endDate), "MMM dd, yyyy")}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Subject
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Code
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Marks
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Percentage
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Grade
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedExamGroup.results.map((result) => {
                    const percentage = Math.round(
                      (result.marks / result.maxMarks) * 100
                    );
                    return (
                      <tr
                        key={result.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">
                            {result.subject.name}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {result.subject.code}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold">
                            {result.marks} / {result.maxMarks}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`font-semibold ${getGradeColor(percentage)}`}>
                            {percentage}%
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">
                            {result.grade || getGrade(percentage)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {result.remarks || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Exam Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Marks</p>
                  <p className="text-lg font-semibold">
                    {selectedExamGroup.results.reduce((sum, r) => sum + r.marks, 0)} /{" "}
                    {selectedExamGroup.results.reduce((sum, r) => sum + r.maxMarks, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average Percentage</p>
                  <p className="text-lg font-semibold">
                    {Math.round(
                      (selectedExamGroup.results.reduce(
                        (sum, r) => sum + (r.marks / r.maxMarks) * 100,
                        0
                      ) /
                        selectedExamGroup.results.length) *
                        100
                    ) / 100}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subjects</p>
                  <p className="text-lg font-semibold">
                    {selectedExamGroup.results.length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Results Summary */}
      {examGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Exam Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {examGroups.map((group) => {
                const examTotal = group.results.reduce((sum, r) => sum + r.marks, 0);
                const examMax = group.results.reduce((sum, r) => sum + r.maxMarks, 0);
                const examPercentage = Math.round((examTotal / examMax) * 100);

                return (
                  <div
                    key={group.exam.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedExam(group.exam.id)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {group.exam.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(group.exam.startDate), "MMM dd, yyyy")} •{" "}
                        {group.exam.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {examTotal} / {examMax}
                      </p>
                      <p className={`text-sm ${getGradeColor(examPercentage)}`}>
                        {examPercentage}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {results.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No results available yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
