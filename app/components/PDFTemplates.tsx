"use client";

import Image from "next/image";

/* ────────── TEMPLATE: Fee Receipt ────────── */
export function FeeReceiptPDF({
  studentName, admissionNo, className, fatherName,
  amountPaid, paymentMode, receiptNo, date, feeHead,
}: {
  studentName: string; admissionNo: string; className: string;
  fatherName?: string; amountPaid: number; paymentMode: string;
  receiptNo: string; date: string; feeHead: string;
}) {
  return (
    <div className="p-8 text-sm">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">R. G. D. Academy</h1>
        <p className="text-xs text-gray-600">Bharapur Nagina, Distt. Bijnor (U.P.)</p>
        <p className="text-lg font-semibold mt-2">Fee Receipt</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div><span className="font-semibold">Receipt No:</span> {receiptNo}</div>
        <div className="text-right"><span className="font-semibold">Date:</span> {date}</div>
        <div><span className="font-semibold">Student Name:</span> {studentName}</div>
        <div><span className="font-semibold">Admission No:</span> {admissionNo}</div>
        <div><span className="font-semibold">Class:</span> {className}</div>
        {fatherName && <div><span className="font-semibold">Father Name:</span> {fatherName}</div>}
      </div>
      <table className="w-full border mb-6">
        <thead><tr className="bg-gray-100"><th className="border p-2 text-left">Fee Head</th><th className="border p-2 text-right">Amount</th></tr></thead>
        <tbody>
          <tr><td className="border p-2">{feeHead}</td><td className="border p-2 text-right">₹{amountPaid.toLocaleString()}</td></tr>
          <tr className="font-bold"><td className="border p-2">Total</td><td className="border p-2 text-right">₹{amountPaid.toLocaleString()}</td></tr>
        </tbody>
      </table>
      <div className="text-xs text-gray-600">Payment Mode: {paymentMode}</div>
      <div className="mt-10 grid grid-cols-2 gap-10">
        <div><div className="h-10 border-b mb-1" /><p className="text-xs text-center">Receiver Signature</p></div>
        <div><div className="h-10 border-b mb-1" /><p className="text-xs text-center">Authorized Signatory</p></div>
      </div>
    </div>
  );
}

/* ────────── TEMPLATE: Student Profile ────────── */
export function StudentProfilePDF({ student }: { student: Record<string, string | null | undefined> }) {
  return (
    <div className="p-8 text-sm">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">R. G. D. Academy</h1>
        <p className="text-xs text-gray-600">Bharapur Nagina, Distt. Bijnor (U.P.)</p>
        <p className="text-lg font-semibold mt-2">Student Profile</p>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {[
          ["Name", student.name], ["Admission No", student.admissionNo],
          ["Roll Number", student.rollNumber], ["Class", student.className],
          ["Father Name", student.fatherName], ["Mother Name", student.motherName],
          ["DOB", student.dob], ["Gender", student.gender],
          ["Blood Group", student.bloodGroup], ["Category", student.category],
          ["Email", student.email], ["Phone", student.phone],
          ["Address", student.address], ["Guardian Phone", student.guardianPhone],
        ].filter(([,v]) => v).map(([l, v]) => (
          <div key={l as string} className="flex gap-2">
            <span className="font-semibold min-w-32">{l as string}:</span>
            <span>{v as string}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────── TEMPLATE: Admission Form ────────── */
export function AdmissionFormPDF({ student }: { student: Record<string, string | null | undefined> }) {
  return (
    <div className="p-8 text-sm">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">R. G. D. Academy</h1>
        <p className="text-xs text-gray-600">Bharapur Nagina, Distt. Bijnor (U.P.)</p>
        <p className="text-lg font-semibold mt-2">Admission Form</p>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {[
          ["Student Name", student.name], ["Admission No", student.admissionNo],
          ["Date of Admission", student.admissionDate], ["Class", student.className],
          ["Roll Number", student.rollNumber], ["Session", student.session],
          ["Date of Birth", student.dob], ["Gender", student.gender],
          ["Blood Group", student.bloodGroup], ["Category", student.category],
          ["Religion", student.religion], ["Caste", student.caste],
          ["Aadhar No", student.aadharNo], ["UDISE No", student.udise],
          ["Father Name", student.fatherName], ["Father Occupation", student.fatherOccupation],
          ["Mother Name", student.motherName], ["Mother Occupation", student.motherOccupation],
          ["Guardian Phone", student.guardianPhone], ["Email", student.email],
          ["Phone", student.phone], ["Address", student.address],
          ["Permanent Address", student.permanentAddress], ["Previous School", student.previousSchool],
        ].filter(([,v]) => v).map(([l, v]) => (
          <div key={l as string} className="flex gap-2">
            <span className="font-semibold min-w-36">{l as string}:</span>
            <span>{v as string}</span>
          </div>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-10">
        <div><div className="h-10 border-b mb-1" /><p className="text-xs text-center">Parent/Guardian</p></div>
        <div><div className="h-10 border-b mb-1" /><p className="text-xs text-center">Principal</p></div>
      </div>
    </div>
  );
}

/* ────────── TEMPLATE: Attendance Report ────────── */
export function AttendanceReportPDF({
  studentName, className, month, year, stats, records,
}: {
  studentName: string; className: string; month: string; year: string;
  stats: { present: number; absent: number; late: number; leave: number; total: number; percentage: number };
  records: { date: string; status: string }[];
}) {
  return (
    <div className="p-8 text-sm">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">R. G. D. Academy</h1>
        <p className="text-xs text-gray-600">Bharapur Nagina, Distt. Bijnor (U.P.)</p>
        <p className="text-lg font-semibold mt-2">Attendance Report</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div><span className="font-semibold">Student:</span> {studentName}</div>
        <div><span className="font-semibold">Class:</span> {className}</div>
        <div><span className="font-semibold">Month:</span> {month} {year}</div>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-6 text-center">
        {[{ label: "Present", value: stats.present, color: "text-green-600" },
          { label: "Absent", value: stats.absent, color: "text-red-600" },
          { label: "Late", value: stats.late, color: "text-yellow-600" },
          { label: "Leave", value: stats.leave, color: "text-blue-600" },
          { label: "Percentage", value: `${stats.percentage}%`, color: "text-green-700" },
        ].map(s => (
          <div key={s.label} className="border rounded p-2">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <table className="w-full border">
        <thead><tr className="bg-gray-100">
          <th className="border p-2 text-left">Date</th><th className="border p-2 text-left">Status</th>
        </tr></thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i}><td className="border p-2">{r.date}</td><td className="border p-2">{r.status}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ────────── TEMPLATE: Class-wise Student List ────────── */
export function ClassStudentListPDF({
  className, session, students, total,
}: {
  className: string; session: string;
  students: { sNo: number; name: string; admissionNo: string; rollNumber: string; fatherName?: string }[];
  total: number;
}) {
  return (
    <div className="p-8 text-sm">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">R. G. D. Academy</h1>
        <p className="text-xs text-gray-600">Bharapur Nagina, Distt. Bijnor (U.P.)</p>
        <p className="text-lg font-semibold mt-2">Student List - {className}</p>
        <p className="text-sm">Session: {session}</p>
      </div>
      <table className="w-full border mb-4">
        <thead><tr className="bg-gray-100">
          <th className="border p-2">S.No</th><th className="border p-2 text-left">Name</th>
          <th className="border p-2 text-left">Admission No</th><th className="border p-2 text-left">Roll No</th>
          <th className="border p-2 text-left">Father Name</th>
        </tr></thead>
        <tbody>
          {students.map(s => (
            <tr key={s.sNo}><td className="border p-2 text-center">{s.sNo}</td>
              <td className="border p-2">{s.name}</td><td className="border p-2">{s.admissionNo}</td>
              <td className="border p-2">{s.rollNumber}</td><td className="border p-2">{s.fatherName ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-right font-semibold">Total Students: {total}</p>
    </div>
  );
}

/* ────────── TEMPLATE: Defaulter List ────────── */
export function DefaulterListPDF({
  className, defaulters,
}: {
  className: string;
  defaulters: { sNo: number; name: string; admissionNo: string; fatherName?: string; dueAmount: number }[];
}) {
  return (
    <div className="p-8 text-sm">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">R. G. D. Academy</h1>
        <p className="text-xs text-gray-600">Bharapur Nagina, Distt. Bijnor (U.P.)</p>
        <p className="text-lg font-semibold mt-2">Fee Defaulter List</p>
        {className && <p className="text-sm">Class: {className}</p>}
      </div>
      <table className="w-full border">
        <thead><tr className="bg-gray-100">
          <th className="border p-2">S.No</th><th className="border p-2 text-left">Name</th>
          <th className="border p-2 text-left">Admission No</th><th className="border p-2 text-left">Father Name</th>
          <th className="border p-2 text-right">Due Amount</th>
        </tr></thead>
        <tbody>
          {defaulters.map(d => (
            <tr key={d.sNo}><td className="border p-2 text-center">{d.sNo}</td>
              <td className="border p-2">{d.name}</td><td className="border p-2">{d.admissionNo}</td>
              <td className="border p-2">{d.fatherName ?? "—"}</td>
              <td className="border p-2 text-right text-red-600">₹{d.dueAmount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-center text-sm">Please clear your dues at the earliest.</p>
      <div className="mt-10 grid grid-cols-2 gap-10">
        <div><div className="h-10 border-b mb-1" /><p className="text-xs text-center">Accountant</p></div>
        <div><div className="h-10 border-b mb-1" /><p className="text-xs text-center">Principal</p></div>
      </div>
    </div>
  );
}

/* ────────── TEMPLATE: Monthly Fee Collection Report ────────── */
export function MonthlyFeeCollectionPDF({
  month, year, totalCollected, totalDue, collections,
}: {
  month: string; year: string; totalCollected: number; totalDue: number;
  collections: { date: string; head: string; amount: number; mode: string }[];
}) {
  return (
    <div className="p-8 text-sm">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">R. G. D. Academy</h1>
        <p className="text-xs text-gray-600">Bharapur Nagina, Distt. Bijnor (U.P.)</p>
        <p className="text-lg font-semibold mt-2">Fee Collection Report</p>
        <p className="text-sm">{month} {year}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border rounded p-3 text-center">
          <p className="text-xs text-gray-500">Total Collected</p>
          <p className="text-2xl font-bold text-green-600">₹{totalCollected.toLocaleString()}</p>
        </div>
        <div className="border rounded p-3 text-center">
          <p className="text-xs text-gray-500">Total Due</p>
          <p className="text-2xl font-bold text-red-600">₹{totalDue.toLocaleString()}</p>
        </div>
      </div>
      <table className="w-full border">
        <thead><tr className="bg-gray-100">
          <th className="border p-2 text-left">Date</th><th className="border p-2 text-left">Head</th>
          <th className="border p-2 text-right">Amount</th><th className="border p-2 text-left">Mode</th>
        </tr></thead>
        <tbody>
          {collections.map((c, i) => (
            <tr key={i}><td className="border p-2">{c.date}</td><td className="border p-2">{c.head}</td>
              <td className="border p-2 text-right">₹{c.amount.toLocaleString()}</td><td className="border p-2">{c.mode}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ────────── TEMPLATE: Staff Profile ────────── */
export function StaffProfilePDF({ staff }: { staff: Record<string, string | null | undefined> }) {
  return (
    <div className="p-8 text-sm">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">R. G. D. Academy</h1>
        <p className="text-xs text-gray-600">Bharapur Nagina, Distt. Bijnor (U.P.)</p>
        <p className="text-lg font-semibold mt-2">Staff Profile</p>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {[
          ["Name", staff.name], ["Staff ID", staff.staffId],
          ["Designation", staff.designation], ["Department", staff.department],
          ["Qualification", staff.qualification], ["Email", staff.email],
          ["Phone", staff.phone], ["Address", staff.address],
          ["Date of Joining", staff.dateOfJoining], ["Gender", staff.gender],
          ["DOB", staff.dob],
        ].filter(([,v]) => v).map(([l, v]) => (
          <div key={l as string} className="flex gap-2">
            <span className="font-semibold min-w-28">{l as string}:</span>
            <span>{v as string}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────── TEMPLATE: Exam Timetable ────────── */
export function ExamTimetablePDF({
  examName, className, dateSheet,
}: {
  examName: string; className: string;
  dateSheet: { date: string; day: string; subject: string; time: string; room?: string }[];
}) {
  return (
    <div className="p-8 text-sm">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">R. G. D. Academy</h1>
        <p className="text-xs text-gray-600">Bharapur Nagina, Distt. Bijnor (U.P.)</p>
        <p className="text-lg font-semibold mt-2">Exam Timetable</p>
        <p className="text-sm">{examName} | Class: {className}</p>
      </div>
      <table className="w-full border">
        <thead><tr className="bg-gray-100">
          <th className="border p-2">Date</th><th className="border p-2">Day</th>
          <th className="border p-2 text-left">Subject</th><th className="border p-2">Time</th>
          {dateSheet[0]?.room && <th className="border p-2">Room</th>}
        </tr></thead>
        <tbody>
          {dateSheet.map((d, i) => (
            <tr key={i}><td className="border p-2 text-center">{d.date}</td>
              <td className="border p-2 text-center">{d.day}</td>
              <td className="border p-2">{d.subject}</td>
              <td className="border p-2 text-center">{d.time}</td>
              {d.room && <td className="border p-2 text-center">{d.room}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ────────── TEMPLATE: Monthly Expense Report ────────── */
export function MonthlyExpensePDF({
  month, year, totalExpenses, expenses,
}: {
  month: string; year: string; totalExpenses: number;
  expenses: { date: string; category: string; description: string; amount: number; paidTo: string }[];
}) {
  return (
    <div className="p-8 text-sm">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">R. G. D. Academy</h1>
        <p className="text-xs text-gray-600">Bharapur Nagina, Distt. Bijnor (U.P.)</p>
        <p className="text-lg font-semibold mt-2">Monthly Expense Report</p>
        <p className="text-sm">{month} {year}</p>
      </div>
      <div className="text-right text-xl font-bold mb-6">Total: ₹{totalExpenses.toLocaleString()}</div>
      <table className="w-full border">
        <thead><tr className="bg-gray-100">
          <th className="border p-2 text-left">Date</th><th className="border p-2 text-left">Category</th>
          <th className="border p-2 text-left">Description</th><th className="border p-2 text-left">Paid To</th>
          <th className="border p-2 text-right">Amount</th>
        </tr></thead>
        <tbody>
          {expenses.map((e, i) => (
            <tr key={i}><td className="border p-2">{e.date}</td><td className="border p-2">{e.category}</td>
              <td className="border p-2">{e.description}</td><td className="border p-2">{e.paidTo}</td>
              <td className="border p-2 text-right">₹{e.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ────────── TEMPLATE: Class Result ────────── */
export function ClassResultPDF({
  examName, className, session, results,
}: {
  examName: string; className: string; session: string;
  results: { rank: number; name: string; rollNumber: string; totalMarks: number; maxMarks: number; percentage: string }[];
}) {
  return (
    <div className="p-8 text-sm">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">R. G. D. Academy</h1>
        <p className="text-xs text-gray-600">Bharapur Nagina, Distt. Bijnor (U.P.)</p>
        <p className="text-lg font-semibold mt-2">Class Result</p>
        <p className="text-sm">{examName} | {className} | Session: {session}</p>
      </div>
      <table className="w-full border">
        <thead><tr className="bg-gray-100">
          <th className="border p-2">Rank</th><th className="border p-2 text-left">Name</th>
          <th className="border p-2 text-left">Roll No</th><th className="border p-2 text-right">Marks</th>
          <th className="border p-2 text-right">Max</th><th className="border p-2 text-right">%</th>
        </tr></thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i}><td className="border p-2 text-center">{r.rank}</td>
              <td className="border p-2">{r.name}</td><td className="border p-2">{r.rollNumber}</td>
              <td className="border p-2 text-right">{r.totalMarks}</td><td className="border p-2 text-right">{r.maxMarks}</td>
              <td className="border p-2 text-right font-semibold">{r.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ────────── TEMPLATE: Admit Card ────────── */
export function AdmitCardPDF({
  studentName, rollNumber, className, session, examName, subjects, photo,
}: {
  studentName: string; rollNumber: string; className: string; session: string;
  examName: string; subjects: string[]; photo?: string;
}) {
  return (
    <div className="p-8 text-sm">
      <div className="text-center border-2 border-black p-6 mb-6">
        <h1 className="text-2xl font-bold">R. G. D. Academy</h1>
        <p className="text-xs text-gray-600">Bharapur Nagina, Distt. Bijnor (U.P.)</p>
        <p className="text-lg font-semibold mt-3 uppercase tracking-wider">Admit Card</p>
        <p className="font-semibold">{examName}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          {[
            ["Student Name", studentName], ["Roll Number", rollNumber],
            ["Class", className], ["Session", session],
          ].map(([l, v]) => (
            <div key={l} className="flex gap-2"><span className="font-semibold min-w-28">{l}:</span><span>{v}</span></div>
          ))}
        </div>
        {photo && <div className="text-right"><Image src={photo} alt="Photo" width={80} height={100} className="inline-block border" /></div>}
      </div>
      <p className="font-semibold mb-2">Subjects:</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {subjects.map(s => <span key={s} className="border rounded px-2 py-1 text-xs">{s}</span>)}
      </div>
      <div className="border-t pt-4 text-xs text-gray-600">
        <p>Signature of Student: ___________________</p>
        <p className="mt-6">Signature of Principal: ___________________</p>
      </div>
      <div className="text-center text-xs text-gray-500 mt-4">This admit card must be produced at the time of examination.</div>
    </div>
  );
}

/* ────────── TEMPLATE: Pending Fee Notice ────────── */
export function PendingFeeNoticePDF({
  studentName, fatherName, admissionNo, className, dueAmount, dueDate,
}: {
  studentName: string; fatherName?: string; admissionNo: string; className: string; dueAmount: number; dueDate: string;
}) {
  return (
    <div className="p-8 text-sm">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">R. G. D. Academy</h1>
        <p className="text-xs text-gray-600">Bharapur Nagina, Distt. Bijnor (U.P.)</p>
        <p className="text-lg font-semibold mt-2">Pending Fee Notice</p>
      </div>
      <p className="mb-4">Date: {new Date().toLocaleDateString()}</p>
      <p className="mb-2">To,</p>
      <p className="font-semibold">{fatherName ? `Mr./Ms. ${fatherName}` : "Parent/Guardian"}</p>
      <p>{studentName}, {className}</p>
      <p>Admission No: {admissionNo}</p>
      <div className="my-6 p-4 border border-red-300 bg-red-50 rounded">
        <p className="font-semibold text-red-700">Outstanding Fee: ₹{dueAmount.toLocaleString()}</p>
        <p className="text-red-600 text-xs mt-1">Please pay the above amount by {dueDate} to avoid late fee.</p>
      </div>
      <p className="mt-8">Kindly clear the dues at the earliest.</p>
      <div className="mt-10 text-right">
        <div className="h-10 border-b inline-block w-48 mb-1" />
        <p className="text-xs">Principal</p>
      </div>
    </div>
  );
}

/* ────────── TEMPLATE: Fee Ledger ────────── */
export function FeeLedgerPDF({
  studentName, admissionNo, className, entries, totalPaid, totalDue,
}: {
  studentName: string; admissionNo: string; className: string;
  entries: { date: string; particular: string; debit: number; credit: number; balance: number }[];
  totalPaid: number; totalDue: number;
}) {
  return (
    <div className="p-8 text-sm">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">R. G. D. Academy</h1>
        <p className="text-xs text-gray-600">Bharapur Nagina, Distt. Bijnor (U.P.)</p>
        <p className="text-lg font-semibold mt-2">Student Fee Ledger</p>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div><span className="font-semibold">Name:</span> {studentName}</div>
        <div><span className="font-semibold">Admission No:</span> {admissionNo}</div>
        <div><span className="font-semibold">Class:</span> {className}</div>
      </div>
      <table className="w-full border mb-4">
        <thead><tr className="bg-gray-100">
          <th className="border p-2 text-left">Date</th><th className="border p-2 text-left">Particular</th>
          <th className="border p-2 text-right">Debit</th><th className="border p-2 text-right">Credit</th>
          <th className="border p-2 text-right">Balance</th>
        </tr></thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={i}><td className="border p-2">{e.date}</td><td className="border p-2">{e.particular}</td>
              <td className="border p-2 text-right">{e.debit > 0 ? `₹${e.debit.toLocaleString()}` : "—"}</td>
              <td className="border p-2 text-right">{e.credit > 0 ? `₹${e.credit.toLocaleString()}` : "—"}</td>
              <td className="border p-2 text-right font-semibold">₹{e.balance.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded p-3 text-center"><p className="text-xs text-gray-500">Total Paid</p><p className="text-lg font-bold text-green-600">₹{totalPaid.toLocaleString()}</p></div>
        <div className="border rounded p-3 text-center"><p className="text-xs text-gray-500">Balance Due</p><p className="text-lg font-bold text-red-600">₹{totalDue.toLocaleString()}</p></div>
      </div>
    </div>
  );
}

/* ────────── TEMPLATE: Daily Fee Collection Report ────────── */
export function DailyFeeCollectionPDF({
  date, collections, totalCollected,
}: {
  date: string; collections: { studentName: string; head: string; amount: number; mode: string }[];
  totalCollected: number;
}) {
  return (
    <div className="p-8 text-sm">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">R. G. D. Academy</h1>
        <p className="text-xs text-gray-600">Bharapur Nagina, Distt. Bijnor (U.P.)</p>
        <p className="text-lg font-semibold mt-2">Daily Fee Collection Report</p>
        <p className="text-sm">{date}</p>
      </div>
      <div className="text-right text-xl font-bold mb-6">Total: ₹{totalCollected.toLocaleString()}</div>
      <table className="w-full border">
        <thead><tr className="bg-gray-100">
          <th className="border p-2 text-left">Student</th><th className="border p-2 text-left">Head</th>
          <th className="border p-2 text-right">Amount</th><th className="border p-2 text-left">Mode</th>
        </tr></thead>
        <tbody>
          {collections.map((c, i) => (
            <tr key={i}><td className="border p-2">{c.studentName}</td><td className="border p-2">{c.head}</td>
              <td className="border p-2 text-right">₹{c.amount.toLocaleString()}</td><td className="border p-2">{c.mode}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ────────── TEMPLATE: Staff Attendance Report ────────── */
export function StaffAttendancePDF({
  staffName, designation, month, year, stats, records,
}: {
  staffName: string; designation: string; month: string; year: string;
  stats: { present: number; absent: number; late: number; leave: number; total: number; percentage: number };
  records: { date: string; status: string }[];
}) {
  return (
    <div className="p-8 text-sm">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">R. G. D. Academy</h1>
        <p className="text-xs text-gray-600">Bharapur Nagina, Distt. Bijnor (U.P.)</p>
        <p className="text-lg font-semibold mt-2">Staff Attendance Report</p>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div><span className="font-semibold">Staff:</span> {staffName}</div>
        <div><span className="font-semibold">Designation:</span> {designation}</div>
        <div><span className="font-semibold">Month:</span> {month} {year}</div>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-6 text-center">
        {[{ label: "Present", value: stats.present, color: "text-green-600" },
          { label: "Absent", value: stats.absent, color: "text-red-600" },
          { label: "Late", value: stats.late, color: "text-yellow-600" },
          { label: "Leave", value: stats.leave, color: "text-blue-600" },
          { label: "Percentage", value: `${stats.percentage}%`, color: "text-green-700" },
        ].map(s => (
          <div key={s.label} className="border rounded p-2 text-center">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <table className="w-full border">
        <thead><tr className="bg-gray-100">
          <th className="border p-2 text-left">Date</th><th className="border p-2 text-left">Status</th>
        </tr></thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i}><td className="border p-2">{r.date}</td><td className="border p-2">{r.status}</td></tr>
          ))}
        </tbody>
      </table>
      <div className="mt-10 text-right"><div className="h-10 border-b inline-block w-48 mb-1" /><p className="text-xs">Authorized Signatory</p></div>
    </div>
  );
}
