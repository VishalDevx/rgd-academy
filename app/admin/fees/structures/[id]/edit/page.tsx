"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Loader2, IndianRupee } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card"

interface ClassType {
  id: string
  name: string
}

interface FeeCategory {
  id: string
  name: string
}

export default function EditFeeStructurePage() {
  const router = useRouter()
  const params = useParams()
  const [classes, setClasses] = useState<ClassType[]>([])
  const [categories, setCategories] = useState<FeeCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    classId: "",
    categoryId: "",
    name: "",
    tuitionFee: "",
    examFee: "",
    transportFee: "",
    miscFee: "",
    monthlyFee: "",
    totalMonths: "12",
  })

  useEffect(() => {
    const id = params.id as string

    Promise.all([
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/fees/categories").then((r) => r.json()),
      fetch(`/api/fees/structures/${id}`).then((r) => r.json()),
    ])
      .then(([classesData, categoriesData, structure]) => {
        setClasses(classesData.data || [])
        setCategories(categoriesData)

        setForm({
          classId: structure.classId || "",
          categoryId: structure.categoryId || "",
          name: structure.name || "",
          tuitionFee: structure.tuitionFee?.toString() || "",
          examFee: structure.examFee?.toString() || "",
          transportFee: structure.transportFee?.toString() || "",
          miscFee: structure.miscFee?.toString() || "",
          monthlyFee: structure.monthlyFee?.toString() || "",
          totalMonths: structure.totalMonths?.toString() || "12",
        })
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false))
  }, [params.id])

  const monthlyAmount = Number(form.monthlyFee) || 0
  const months = Number(form.totalMonths) || 12
  const totalPreview = monthlyAmount * months

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch(`/api/fees/structures/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          categoryId: form.categoryId || null,
        }),
      })

      if (!res.ok) throw new Error("Failed to update")

      toast.success("Fee structure updated")
      router.push("/admin/fees/structures")
    } catch {
      toast.error("Failed to update fee structure")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-8" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Fee Structure</h1>
        <p className="text-sm text-muted-foreground">Update fee structure details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Structure Details</CardTitle>
          <CardDescription>
            Note: Changing amounts won&apos;t affect existing payment records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select
                  value={form.classId}
                  onValueChange={(v) => setForm({ ...form, classId: v })}
                >
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm({ ...form, categoryId: v })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Annual Tuition Fee 2026"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyFee">Monthly Fee (₹)</Label>
                <Input
                  id="monthlyFee"
                  type="number"
                  value={form.monthlyFee}
                  onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalMonths">Total Months</Label>
                <Input
                  id="totalMonths"
                  type="number"
                  min="1"
                  value={form.totalMonths}
                  onChange={(e) => setForm({ ...form, totalMonths: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tuitionFee">Tuition Fee (₹)</Label>
                <Input
                  id="tuitionFee"
                  type="number"
                  value={form.tuitionFee}
                  onChange={(e) => setForm({ ...form, tuitionFee: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="examFee">Exam Fee (₹)</Label>
                <Input
                  id="examFee"
                  type="number"
                  value={form.examFee}
                  onChange={(e) => setForm({ ...form, examFee: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transportFee">Transport Fee (₹)</Label>
                <Input
                  id="transportFee"
                  type="number"
                  value={form.transportFee}
                  onChange={(e) => setForm({ ...form, transportFee: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="miscFee">Miscellaneous Fee (₹)</Label>
                <Input
                  id="miscFee"
                  type="number"
                  value={form.miscFee}
                  onChange={(e) => setForm({ ...form, miscFee: e.target.value })}
                />
              </div>
            </div>

            {monthlyAmount > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Annual Total</span>
                  <span className="text-lg font-bold text-primary">
                    <IndianRupee className="inline h-4 w-4" />
                    {totalPreview.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Structure
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
