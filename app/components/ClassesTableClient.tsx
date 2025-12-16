// app/admin/classes/ClassesTableClient.tsx (Client Component)
"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/app/components/ui/table";
import { motion } from "framer-motion";

export default function ClassesTableClient({ classes }: { classes: any[] }) {
  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-indigo-50 via-white to-pink-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
      >
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
          Classes
        </h1>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-md" asChild>
          <Link href="/admin/classes/new">New Class</Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <Card className="shadow-none">
          <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 rounded-t-2xl">
            <CardTitle className="text-lg md:text-xl font-semibold text-gray-800">
              All Classes
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-indigo-50">
                    <TableHead>Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Class Teacher</TableHead>
                    <TableHead>Academic Session</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {classes.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="hover:bg-indigo-50 transition-colors duration-200"
                    >
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.grade}</TableCell>
                      <TableCell>{c.section ?? "-"}</TableCell>
                      <TableCell>{c.teacher?.user?.name || "-"}</TableCell>
                      <TableCell>{c.academicSession?.name || "-"}</TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
