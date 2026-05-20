"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Search, IndianRupee } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"
import { Badge } from "@/app/components/ui/badge"

interface FeeStructure {
  id: string
  name: string | null
  monthlyFee: number | null
  totalMonths: number
  total: number
  tuitionFee: number | null
  examFee: number | null
  transportFee: number | null
  miscFee: number | null
  class: { id: string; name: string }
  category: { id: string; name: string } | null
  _count: { payments: number }
}

export default function FeeStructuresPage() {
  const router = useRouter()
  const [structures, setStructures] = useState<FeeStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const fetchStructures = async () => {
    try {
      const res = await fetch("/api/fees/structures")
      if (!res.ok) throw new Error("Failed to load")
      setStructures(await res.json())
    } catch {
      toast.error("Failed to load fee structures")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStructures()
  }, [])

  const handleDelete = async (id: string, name: string | null) => {
    if (!confirm(`Delete fee structure "${name || "Untitled"}"? This will also delete all related payments.`))
      return

    try {
      const res = await fetch(`/api/fees/structures/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Fee structure deleted")
      fetchStructures()
    } catch {
      toast.error("Failed to delete fee structure")
    }
  }

  const filtered = structures.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.class.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fee Structures</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage fee structures for each class
          </p>
        </div>
        <Button onClick={() => router.push("/admin/fees/structures/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Structure
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>All Structures</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search structures..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            {filtered.length} structure{filtered.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Monthly</TableHead>
                <TableHead className="text-right">Months</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Payments</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No fee structures found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.id} className="group">
                    <TableCell className="font-medium">{s.name || "Untitled"}</TableCell>
                    <TableCell>{s.class.name}</TableCell>
                    <TableCell>
                      {s.category ? (
                        <Badge variant="outline">{s.category.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        {s.monthlyFee?.toLocaleString() ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{s.totalMonths}</TableCell>
                    <TableCell className="text-right font-medium">
                      <IndianRupee className="inline h-3 w-3" />
                      {s.total.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{s._count.payments}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/fees/structures/${s.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(s.id, s.name)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
