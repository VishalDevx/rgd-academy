"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Bell,
  BellRing,
  Megaphone,
  Calendar,
  User,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";

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

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface AnnouncementsData {
  announcements: Announcement[];
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
}

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch announcements
        const announcementsRes = await fetch("/api/announcements");
        if (announcementsRes.ok) {
          const announcementsData = await announcementsRes.json();
          // Filter for student-visible announcements
          const studentAnnouncements = announcementsData.filter(
            (a: Announcement) =>
              a.visibleRoles.some((vr) => vr.role === "STUDENT")
          );
          setAnnouncements(studentAnnouncements);
        }

        // Fetch notifications
        const notificationsRes = await fetch("/api/student/notifications");
        if (notificationsRes.ok) {
          const notificationsData = await notificationsRes.json();
          setNotifications(notificationsData.notifications || []);
          setUnreadCount(notificationsData.unreadCount || 0);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/student/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, read: true }),
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      await Promise.all(
        unreadNotifications.map((n) =>
          fetch("/api/student/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notificationId: n.id, read: true }),
          })
        )
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">
            Announcements & Notifications
          </h1>
          <p className="text-gray-500 mt-1">
            Stay updated with school announcements and notifications
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Announcements
            </CardTitle>
            <Megaphone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-gray-500 mt-1">Total announcements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Notifications
            </CardTitle>
            {unreadCount > 0 ? (
              <BellRing className="h-4 w-4 text-orange-600" />
            ) : (
              <Bell className="h-4 w-4 text-gray-400" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {unreadCount > 0 && (
                <span className="text-orange-600">{unreadCount}</span>
              )}
              {unreadCount === 0 && notifications.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {unreadCount > 0
                ? "unread notification" + (unreadCount !== 1 ? "s" : "")
                : "all caught up"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-orange-100 text-orange-700">
                  {unreadCount} new
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    !notification.read
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(notification.createdAt), "MMM dd, yyyy HH:mm")}
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="ml-4"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No notifications</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            School Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-5 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {announcement.title}
                    </h3>
                    <Badge variant="outline">Announcement</Badge>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap mt-2">
                    {announcement.content}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No announcements available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
