"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Label } from "@/app/components/ui/label";

const ROLES = ["ADMIN", "STAFF", "STUDENT"];

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", content: "", roles: [] as string[] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleRole = (role: string) => {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role)
        ? f.roles.filter((r) => r !== role)
        : [...f.roles, role],
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  setError("");

  try {
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) throw new Error(await res.text());

    router.push("/admin/announcements");
  } catch (err: unknown) {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Failed");
    }
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div className="flex justify-center p-6">
      <Card className="w-full max-w-xl shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">New Announcement</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Content</Label>
              <Textarea
                rows={5}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Visible Roles</Label>
              <div className="flex gap-4">
                {ROLES.map((r) => (
                  <div key={r} className="flex items-center space-x-2">
                    <Checkbox
                      checked={form.roles.includes(r)}
                      onCheckedChange={() => toggleRole(r)}
                    />
                    <Label>{r}</Label>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>

          <CardFooter className="flex gap-2 justify-end">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
