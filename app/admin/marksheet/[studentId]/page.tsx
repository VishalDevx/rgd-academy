// app/admin/marksheet/[studentId]/page.tsx
import MarksheetClient from "../../../components/MarksheetClient";

export default async function MarksheetPage({ params }: { params: { studentId: string } | Promise<{ studentId: string }> }) {
  // Unwrap params if it is a Promise
  const resolvedParams = "then" in params ? await params : params;
  const studentId = resolvedParams.studentId;

  // Pass as prop to client component
  return <MarksheetClient studentId={studentId} />;
}
