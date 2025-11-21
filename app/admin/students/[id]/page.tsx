import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const { id } =  await params;

  const student = await db.student.findUnique({
    where: { id },
    include: {
      user: true,
      class: true,
      fees: { include: { feeStructure: true }, orderBy: { createdAt: "desc" } },
      results: { include: { exam: true, subject: true } },
      attendance: true,
    },
  });

  if (!student) return notFound();

  const { user, class: cls } = student;
  const totalFeesPaid = student.fees.reduce((sum, f) => sum + Number(f.amountPaid), 0);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 relative">
        <Avatar className="w-36 h-36">
          <AvatarImage src={student.profileImg || "/default-avatar.png"} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>

        <div className="text-center sm:text-left flex-1 space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-gray-500 text-sm">
            Admission No: <span className="font-medium">{student.admissionNo}</span> | Roll No:{" "}
            <span className="font-medium">{student.rollNumber}</span>
          </p>
          <p className="text-gray-500 text-sm">
            Class: <span className="font-medium">{cls?.name || "N/A"}</span> | Gender:{" "}
            <span className="font-medium">{student.gender || "N/A"}</span>
          </p>
        </div>

        {/* Edit Button */}
        <Link href={`/admin/students/${student.id}/edit`} className="absolute top-4 right-4">
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
              <p><strong>DOB:</strong> {student.dob ? new Date(student.dob).toDateString() : "N/A"}</p>
              <p><strong>Address:</strong> {student.address || "N/A"}</p>
              <p><strong>Active:</strong> {student.active ? <Badge variant="outline">Yes</Badge> : <Badge variant="destructive">No</Badge>}</p>
              <p><strong>Aadhar No:</strong> {user.adharNo || "N/A"}</p>
              <p><strong>Contact No:</strong> {student.contactNo}</p>
              <p><strong>Father's Name:</strong> {student.fatherName}</p>
              <p><strong>Mother's Name:</strong> {student.motherName}</p>
              <p><strong>Occupation:</strong> {student.occupation}</p>
              <p><strong>Religion:</strong> {student.religion}</p>
              <p><strong>Caste:</strong> {student.caste}</p>
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
              <p><strong>Class:</strong> {cls?.name || "N/A"}</p>
              <p><strong>Admission Date:</strong> {student.admissionDate.toDateString()}</p>
              <p><strong>UDISE No:</strong> {student.udiseCode}</p>
              <p><strong>Admission No:</strong> {student.admissionNo}</p>
              <p><strong>Total Fees Paid:</strong> ₹{totalFeesPaid.toFixed(2)}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fees Section */}
        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle>Fee Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {student.fees.length === 0 ? (
                <p className="text-gray-500">No fee records available.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fee Name</TableHead>
                      <TableHead>Amount Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.fees.map(fee => (
                      <TableRow key={fee.id}>
                        <TableCell>{fee.feeStructure?.name || "-"}</TableCell>
                        <TableCell>₹{fee.amountPaid.toString()}</TableCell>
                        <TableCell>
                          {fee.status === "PAID" ? <Badge variant="outline">Paid</Badge> :
                           fee.status === "PENDING" ? <Badge variant="destructive">Pending</Badge> :
                           <Badge variant="destructive">Partial</Badge>}
                        </TableCell>
                        <TableCell>{fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Section */}
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Exam Results</CardTitle>
            </CardHeader>
            <CardContent>
              {student.results.length === 0 ? (
                <p className="text-gray-500">No results available.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Max Marks</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.results.map(r => (
                      <TableRow key={r.id}>
                        <TableCell>{r.exam?.name}</TableCell>
                        <TableCell>{r.subject?.name}</TableCell>
                        <TableCell>{r.marks}</TableCell>
                        <TableCell>{r.maxMarks}</TableCell>
                        <TableCell>{r.grade || "-"}</TableCell>
                        <TableCell>{r.remarks || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Section */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {student.attendance.length === 0 ? (
                <p className="text-gray-500">No attendance records available.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.attendance.map(a => (
                      <TableRow key={a.id}>
                        <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {a.status === "PRESENT" ? <Badge variant="outline">Present</Badge> :
                           a.status === "ABSENT" ? <Badge variant="destructive">Absent</Badge> :
                           a.status === "LATE" ? <Badge variant="destructive">Late</Badge> :
                           <Badge variant="secondary">Leave</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Link href="/admin/students" className="text-blue-600 hover:underline font-medium">
          ← Back to Students
        </Link>
      </div>
    </div>
  );
}
