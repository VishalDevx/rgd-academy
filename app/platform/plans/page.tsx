import { db } from "@/lib/prisma"
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

export default async function PlansPage() {
  const plans = await db.plan.findMany({
    orderBy: { sortOrder: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plans</h1>
        <p className="text-muted-foreground mt-1">Manage subscription plans and their features</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Plans ({plans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Monthly Price</TableHead>
                <TableHead>Yearly Price</TableHead>
                <TableHead>Max Students</TableHead>
                <TableHead>Max Staff</TableHead>
                <TableHead>Max Branches</TableHead>
                <TableHead>Storage (GB)</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell className="text-muted-foreground">{plan.code}</TableCell>
                  <TableCell>
                    {plan.priceMonthly === 0 ? "Free" : `₹${plan.priceMonthly.toLocaleString()}`}
                  </TableCell>
                  <TableCell>
                    {plan.priceYearly === 0 ? "Free" : `₹${plan.priceYearly.toLocaleString()}`}
                  </TableCell>
                  <TableCell>{plan.maxStudents}</TableCell>
                  <TableCell>{plan.maxStaff}</TableCell>
                  <TableCell>{plan.maxBranches}</TableCell>
                  <TableCell>{plan.storageGB}</TableCell>
                  <TableCell>{plan.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
