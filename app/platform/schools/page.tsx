import { db } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"

const statusBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  TRIALING: "secondary",
  REGISTERED: "outline",
  SUSPENDED: "destructive",
  CANCELLED: "destructive",
  EXPIRED: "destructive",
  PAST_DUE: "destructive",
}

export default async function SchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  const schools = await db.organization.findMany({
    where: q
      ? { name: { contains: q, mode: "insensitive" } }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      subscriptions: {
        include: { plan: true },
        take: 1,
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schools</h1>
        <p className="text-muted-foreground mt-1">Manage all registered schools</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Schools ({schools.length})</CardTitle>
            <form>
              <Input
                name="q"
                placeholder="Search by name..."
                defaultValue={q ?? ""}
                className="w-64"
              />
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell className="text-muted-foreground">{school.slug}</TableCell>
                  <TableCell>{school.email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant[school.status] ?? "outline"}>
                      {school.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{school.subscriptions[0]?.plan.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {school.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/platform/schools/${school.id}`}>View</Link>
                      </Button>
                      {school.status === "SUSPENDED" ? (
                        <Button variant="outline" size="sm">Activate</Button>
                      ) : (
                        <Button variant="destructive" size="sm">Suspend</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {schools.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {q ? "No schools match your search" : "No schools registered yet"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
