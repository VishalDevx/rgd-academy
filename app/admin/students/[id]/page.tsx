import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
  const totalFeesPaid = student.fees.reduce(
    (sum, f) => sum + Number(f.amountPaid),
    0
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-white p-6 rounded-xl shadow border border-gray-200">
        <Image
          src={student.profileImg || "/default-avatar.png"}
          alt={user.name}
          width={140}
          height={140}
          className="rounded-full border border-gray-300 object-cover w-36 h-36"
        />
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-gray-500 text-sm mt-1">
            Admission No: <span className="font-medium">{student.admissionNo}</span> | Roll No:{" "}
            <span className="font-medium">{student.rollNumber}</span>
          </p>
          <p className="text-gray-500 text-sm">
            Class: <span className="font-medium">{cls?.name || "N/A"}</span> | Gender:{" "}
            <span className="font-medium">{student.gender || "N/A"}</span>
          </p>
        </div>
      </div>

      {/* Personal & Academic Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
          <ul className="text-gray-600 space-y-2">
            <li><strong>DOB:</strong> {student.dob ? new Date(student.dob).toDateString() : "N/A"}</li>
            <li><strong>Address:</strong> {student.address || "N/A"}</li>
            <li><strong>Active:</strong> {student.active ? "Yes ✅" : "No ❌"}</li>
            <li><strong>Phone:</strong> {user.phone || "N/A"}</li>
            <li><strong>Adhar No:</strong> {user.adharNo || "N/A"}</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Academic Info</h2>
          <ul className="text-gray-600 space-y-2">
            <li><strong>Class:</strong> {cls?.name || "N/A"}</li>
            <li><strong>Admission Date:</strong> {student.admissionDate.toDateString()}</li>
            <li><strong>Total Fees Paid:</strong> ₹{totalFeesPaid.toFixed(2)}</li>
          </ul>
        </div>
      </div>

      {/* Fees Section */}
      <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Fee Payments</h2>
        {student.fees.length === 0 ? (
          <p className="text-gray-500">No fee records available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-gray-700 text-sm">
              <thead className="bg-gray-100 uppercase text-xs tracking-wide text-gray-600">
                <tr>
                  <th className="p-2">Fee Name</th>
                  <th className="p-2">Amount Paid</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {student.fees.map((fee) => (
                  <tr key={fee.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-2">{fee.feeStructure?.name || "-"}</td>
                    <td className="p-2">₹{fee.amountPaid.toString()}</td>
                    <td className={`p-2 font-medium ${
                      fee.status === "PAID" ? "text-green-600" :
                      fee.status === "PENDING" ? "text-red-500" : "text-yellow-600"
                    }`}>
                      {fee.status}
                    </td>
                    <td className="p-2">{fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Exam Results</h2>
        {student.results.length === 0 ? (
          <p className="text-gray-500">No results available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-gray-700 text-sm">
              <thead className="bg-gray-100 uppercase text-xs tracking-wide text-gray-600">
                <tr>
                  <th className="p-2">Exam</th>
                  <th className="p-2">Subject</th>
                  <th className="p-2">Marks</th>
                  <th className="p-2">Max Marks</th>
                  <th className="p-2">Grade</th>
                  <th className="p-2">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {student.results.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-2">{r.exam?.name}</td>
                    <td className="p-2">{r.subject?.name}</td>
                    <td className="p-2">{r.marks}</td>
                    <td className="p-2">{r.maxMarks}</td>
                    <td className="p-2">{r.grade || "-"}</td>
                    <td className="p-2">{r.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Attendance Section */}
      <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Attendance</h2>
        {student.attendance.length === 0 ? (
          <p className="text-gray-500">No attendance records available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-gray-700 text-sm">
              <thead className="bg-gray-100 uppercase text-xs tracking-wide text-gray-600">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {student.attendance.map((a) => (
                  <tr key={a.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-2">{new Date(a.date).toLocaleDateString()}</td>
                    <td className="p-2 font-medium">
                      {a.status === "PRESENT" ? "✅ Present" :
                       a.status === "ABSENT" ? "❌ Absent" :
                       a.status === "LATE" ? "⏰ Late" : "📝 Leave"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Back Link */}
      <div className="mt-6 text-center md:text-left">
        <Link href="/admin/students" className="text-blue-600 hover:underline font-medium">
          ← Back to Students
        </Link>
      </div>
    </div>
  );
}
