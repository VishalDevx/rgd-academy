// app/admin/marksheet/[studentId]/page.tsx
import MarksheetClient from "../../../components/MarksheetClient";

export default async function MarksheetPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  return <MarksheetClient studentId={studentId} />;
}
