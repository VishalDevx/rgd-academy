"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";

import { Badge } from "@/app/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";

// -----------------------------
// Type Definitions
// -----------------------------
interface StudentData {
  id: string;
  profileImg?: string | null;
  admissionNo: string;
  rollNumber: string;
  dob?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  address?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  occupation?: string | null;
  religion?: string | null;
  caste?: string | null;
  udiseCode?: string | null;
  contactNo?: string | null;
  active: boolean;
  admissionDate: string;
  user: {
    name: string;
    email: string;
    adharNo?: string | null;
  };
  class?: { name: string } | null;
  fees: Array<{
    remainAmount: any;
    id: string;
    amountPaid: number;
    status: "PAID" | "PENDING" | "PARTIAL";
    paymentDate?: string | null;
    feeStructure?: { name: string } | null;
  }>;
  results: Array<{
    id: string;
    marks: number;
    maxMarks: number;
    grade?: string | null;
    remarks?: string | null;
    exam?: { name: string } | null;
    subject?: { name: string } | null;
  }>;
  attendance: Array<{
    id: string;
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE";
  }>;
}

// -----------------------------
// Component
// -----------------------------
export default function StudentProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;

    const fetchStudent = async () => {
      try {
        const res = await fetch(`/api/students/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch student");
        const data = await res.json();

        // Normalize dates to strings for rendering
        const normalized: StudentData = {
          ...data,
          dob: data.dob ? new Date(data.dob).toISOString() : null,
          admissionDate: new Date(data.admissionDate).toISOString(),
        };

        setStudent(normalized);
      } catch (err) {
        console.error(err);
        router.push("/admin/students"); // redirect if not found
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [params?.id, router]);

  if (loading) return <div>Loading...</div>;
  if (!student) return <div>Student not found.</div>;

  const totalFeesPaid = student.fees.reduce(
    (sum, f) => sum + Number(f.amountPaid),
    0
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 relative">
        <Avatar className="w-36 h-36">
          <AvatarImage
            src={student.profileImg || "/default-avatar.png"}
            alt={student.user.name}
          />
          <AvatarFallback>{student.user.name[0]}</AvatarFallback>
        </Avatar>

        <div className="text-center sm:text-left flex-1 space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">
            {student.user.name}
          </h1>
          <p className="text-gray-600">{student.user.email}</p>
          <p className="text-gray-500 text-sm">
            Admission No:{" "}
            <span className="font-medium">{student.admissionNo}</span> | Roll
            No: <span className="font-medium">{student.rollNumber}</span>
          </p>
          <p className="text-gray-500 text-sm">
            Class:{" "}
            <span className="font-medium">{student.class?.name || "N/A"}</span>{" "}
            | Gender:{" "}
            <span className="font-medium">{student.gender || "N/A"}</span>
          </p>
        </div>

        <Link
          href={`/admin/students/${student.id}/edit`}
          className="absolute top-4 right-4"
        >
          <Button variant="outline">Edit</Button>
        </Link>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        {/* Personal Details */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <p>
                <strong>DOB:</strong>{" "}
                {student.dob ? new Date(student.dob).toDateString() : "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {student.address || "N/A"}
              </p>
              <p>
                <strong>Active:</strong>{" "}
                {student.active ? (
                  <Badge variant="outline">Yes</Badge>
                ) : (
                  <Badge variant="destructive">No</Badge>
                )}
              </p>
              <p>
                <strong>Aadhar No:</strong> {student.user.adharNo || "N/A"}
              </p>
              <p>
                <strong>Contact No:</strong> {student.contactNo || "N/A"}
              </p>
              <p>
                <strong>Fathers Name:</strong> {student.fatherName || "N/A"}
              </p>
              <p>
                <strong>Mothers Name:</strong> {student.motherName || "N/A"}
              </p>
              <p>
                <strong>Occupation:</strong> {student.occupation || "N/A"}
              </p>
              <p>
                <strong>Religion:</strong> {student.religion || "N/A"}
              </p>
              <p>
                <strong>Caste:</strong> {student.caste || "N/A"}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Details */}
        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle>Academic Info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <p>
                <strong>Class:</strong> {student.class?.name || "N/A"}
              </p>
              <p>
                <strong>Admission Date:</strong>{" "}
                {new Date(student.admissionDate).toDateString()}
              </p>
              <p>
                <strong>UDISE No:</strong> {student.udiseCode || "N/A"}
              </p>
              <p>
                <strong>Admission No:</strong> {student.admissionNo}
              </p>
              <p>
                <strong>Total Fees Paid:</strong> ₹{totalFeesPaid.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Fees, */}
        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle>Fees Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {student.fees.length === 0 ? (
                <p className="text-gray-500">No fee records found.</p>
              ) : (
                <div className="grid gap-4">
                  {student.fees.map((fee) => (
                    <Card key={fee.id} className="border border-gray-200 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">
                          {fee.feeStructure?.name || "General Fee"}
                        </span>
                        <Badge
                          variant={
                            fee.status === "PAID"
                              ? "default"
                              : fee.status === "PENDING"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {fee.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 text-sm">
                        <p>
                          <strong>Amount Paid:</strong> ₹
                          {fee.amountPaid}
                        </p>
                        <p>
                          <strong>Remaining Amount:</strong> ₹
                          {fee.remainAmount}
                        </p>
                        <p>
                          <strong>Payment Date:</strong>{" "}
                          {fee.paymentDate
                            ? new Date(fee.paymentDate).toDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Results Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {student.results.length === 0 ? (
                <p className="text-gray-500">No results available.</p>
              ) : (
                <div className="grid gap-4">
                  {student.results.map((result) => (
                    <Card
                      key={result.id}
                      className="border border-gray-200 p-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">
                          {result.exam?.name || "General Exam"} -{" "}
                          {result.subject?.name || "Subject"}
                        </span>
                        {result.grade && (
                          <Badge variant="outline">{result.grade}</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 text-sm">
                        <p>
                          <strong>Marks Obtained:</strong> {result.marks}/
                          {result.maxMarks}
                        </p>
                        <p>
                          <strong>Remarks:</strong> {result.remarks || "N/A"}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {student.attendance.length === 0 ? (
                <p className="text-gray-500">
                  No attendance records available.
                </p>
              ) : (
                <div className="grid gap-2">
                  {student.attendance.map((record) => (
                    <Card
                      key={record.id}
                      className="border border-gray-200 p-4 flex justify-between items-center"
                    >
                      <p className="text-gray-700 font-medium">
                        {new Date(record.date).toDateString()}
                      </p>
                      <Badge
                        variant={
                          record.status === "PRESENT"
                            ? "default"
                            : record.status === "ABSENT"
                            ? "destructive"
                            : record.status === "LEAVE"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {record.status}
                      </Badge>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Link
          href="/admin/students"
          className="text-blue-600 hover:underline font-medium"
        >
          ← Back to Students
        </Link>
      </div>
    </div>
  );
}
