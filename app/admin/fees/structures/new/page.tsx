"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"

interface ClassType {
  id: string
  name: string
}

interface FeeCategory {
  id: string
  name: string
}

export default function NewFeeStructurePage() {
  const router = useRouter()
  const [classes, setClasses] = useState<ClassType[]>([])
  const [categories, setCategories] = useState<FeeCategory[]>([])
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
    fetch("/api/classes")
      .then((r) => r.json())
      .then((d) => setClasses(d.data || []))
      .catch(() => toast.error("Failed to load classes"))

    fetch("/api/fees/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => toast.error("Failed to load categories"))
  }, [])

  const monthlyAmount = Number(form.monthlyFee) || 0
  const months = Number(form.totalMonths) || 12
  const totalPreview = monthlyAmount * months

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.classId) {
      toast.error("Please select a class")
      return
    }
    if (!form.monthlyFee || Number(form.monthlyFee) <= 0) {
      toast.error("Monthly fee is required")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/fees/structures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          categoryId: form.categoryId || null,
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(err)
      }

      toast.success("Fee structure created with payment records")
      router.push("/admin/fees/structures")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Fee Structure</h1>
        <p className="text-sm text-muted-foreground">
          Create a monthly fee structure for a class
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Structure Details</CardTitle>
          <CardDescription>
            Payment records will be auto-created for all active students in the selected class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class">Class *</Label>
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
                    <SelectValue placeholder="Select category (optional)" />
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

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Annual Tuition Fee 2026"
                />
              </div>

              <div className="md:col-span-2">
                <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
                  <h3 className="text-sm font-medium">Fee Components</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyFee">Monthly Fee *</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="monthlyFee"
                          type="number"
                          className="pl-8"
                          placeholder="e.g. 4500"
                          value={form.monthlyFee}
                          onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalMonths">Total Months</Label>
                      <Input
                        id="totalMonths"
                        type="number"
                        min="1"
                        max="24"
                        value={form.totalMonths}
                        onChange={(e) => setForm({ ...form, totalMonths: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tuitionFee">Tuition Fee</Label>
                      <Input
                        id="tuitionFee"
                        type="number"
                        value={form.tuitionFee}
                        onChange={(e) => setForm({ ...form, tuitionFee: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="examFee">Exam Fee</Label>
                      <Input
                        id="examFee"
                        type="number"
                        value={form.examFee}
                        onChange={(e) => setForm({ ...form, examFee: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transportFee">Transport Fee</Label>
                      <Input
                        id="transportFee"
                        type="number"
                        value={form.transportFee}
                        onChange={(e) => setForm({ ...form, transportFee: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="miscFee">Miscellaneous Fee</Label>
                      <Input
                        id="miscFee"
                        type="number"
                        value={form.miscFee}
                        onChange={(e) => setForm({ ...form, miscFee: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {monthlyAmount > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Annual Fee Preview</span>
                  <span className="text-lg font-bold text-primary">
                    <IndianRupee className="inline h-4 w-4" />
                    {monthlyAmount.toLocaleString()} × {months} months ={" "}
                    <IndianRupee className="inline h-4 w-4" />
                    {totalPreview.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Structure
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
