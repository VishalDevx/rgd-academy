"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import DeleteDialog from "@/app/components/DeleteDialog";
import { format } from "date-fns";
import { usePDF } from "@/app/lib/usePDF";
import { PDFDownloadButton } from "@/app/components/PDFDownloadButton";

interface ExpenseDetail {
  id: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  transactionType: string;
}

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [expense, setExpense] = useState<ExpenseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const pdf = usePDF(`expense-${params.id}`);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/expenses/${params.id}`);
        const json = await res.json();
        setExpense(json.data || json);
      } catch {
        toast.error("Failed to load expense");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${params.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Expense deleted");
      router.push("/admin/expenses");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!expense) return <div className="text-center py-16 text-muted-foreground">Expense not found</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="flex gap-2">
          <PDFDownloadButton onClick={pdf.generatePDF} loading={pdf.loading} label="PDF" />
          <Button variant="outline" asChild>
            <Link href={`/admin/expenses/${expense.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <div ref={pdf.ref}>
        <Card>
        <CardHeader>
          <CardTitle>{expense.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-2xl font-bold">₹{Number(expense.amount).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <Badge variant={expense.transactionType === "CREDIT" ? "default" : "destructive"}>
                {expense.transactionType === "CREDIT" ? "Income" : "Expense"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p>{format(new Date(expense.date), "dd/MM/yyyy")}</p>
            </div>
          </div>
          {expense.description && (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p>{expense.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Expense"
      />
    </div>
  );
}
