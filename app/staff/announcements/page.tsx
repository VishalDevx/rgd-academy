"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Bell,
  Megaphone,
  Calendar,
  User,
  Plus,
  Edit,
} from "lucide-react";
import Link from "next/link";

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  creator: {
    name: string;
  } | null;
  visibleRoles: {
    role: string;
  }[];
}

export default function StaffAnnouncementsPage() {
  const { data: session } = useSession();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/announcements");
        if (res.ok) {
          const announcementsData = await res.json();
          // Filter for staff-visible announcements
          const staffAnnouncements = announcementsData.filter(
            (a: Announcement) =>
              a.visibleRoles.some((vr) => vr.role === "STAFF") ||
              a.visibleRoles.some((vr) => vr.role === "ADMIN")
          );
          setAnnouncements(staffAnnouncements);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 mt-1">
            View and create school announcements
          </p>
        </div>
        <Link href="/admin/announcements/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Announcement
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Announcements
            </CardTitle>
            <Megaphone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-gray-500 mt-1">Visible to staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Month
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                announcements.filter(
                  (a) =>
                    new Date(a.createdAt).getMonth() === new Date().getMonth()
                ).length
              }
            </div>
            <p className="text-xs text-gray-500 mt-1">New announcements</p>
          </CardContent>
        </Card>
      </div>

      {/* Announcements List */}
      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {announcement.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">Announcement</Badge>
                      {announcement.visibleRoles.map((vr, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {vr.role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap mb-4">
                  {announcement.content}
                </p>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {announcement.creator?.name || "Admin"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(announcement.createdAt), "MMM dd, yyyy HH:mm")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Megaphone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No announcements available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
